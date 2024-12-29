import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css'
import lozad from "lozad";
import Fuse from 'fuse.js';
import Terminal from './components/Terminal';
import Footer from './components/Footer';
import Login from './components/Login';
import { Weapon, WeaponApiResult, WeaponLog, IndexDict } from './types';
import { HTTPError } from './types';
import { DEBOUNCE_MSEC, SEARCH_THRESHOLD, VERSION } from './constants';

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

function App() {
  const {observe} = lozad(".lozad", {
    enableAutoReload: true,
  });

  // Datastate
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [result, setResult] = useState<Weapon[]>([]);
  const [edit, setEdit] = useState<WeaponLog[]>([]);
  const [keyBind, setKeyBind] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  // View child components
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  // UI state
  const [query, setQuery] = useState<string>("");
  const [sortMode, setSortMode] = useState<string>("");
  const [onSave, setOnSave] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const focusRef = useRef<HTMLDivElement>(null);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSortMode("");
  }

  const onKeybind = (e: React.KeyboardEvent<HTMLElement>) => {

    setKeyBind((e.ctrlKey ? "Ctrl+" : "") + e.key);

    if (e.key === "Escape") {
      setQuery("");
    }
    else if (e.ctrlKey && e.key === "f" || e.key === "Enter") {
      e.preventDefault();
      if (e.key === "Enter" && document.activeElement === document.getElementById("terminal")) return;
      const isFocused = document.activeElement === document.getElementById("table-search");
      const searchInput = document.getElementById("table-search");
      if (searchInput) {
        if (!isFocused) {
          searchInput.focus();
        }
        else {
          searchInput.blur()
          focusRef.current?.focus();
        }
      }
    }
    else if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (edit.length > 0) saveChanges();
    }
    else if (e.ctrlKey && e.key === "/") {
      e.preventDefault();
      setShowTerminal(prevTerminal => {
        const newTerminal = !prevTerminal;
        if (!newTerminal) {
          focusRef.current?.focus();
        }
        return newTerminal;
      });
    }
  }

  /**
   * Login to the API.
   *
   * Check console for the access token,
   * See Login component & Terminal component for use.
   * If the user is logged in, retrieve the user's weapons.
   * @error If the credentials are incorrect, throw a `401 Unauthorized`.
   * @return {*} {void}
   */
  const handleLogin = (username: string, password: string) => {
    if (!username || !password) return;
    fetch(`${SERVER_URI}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
        })
        .then(response => {
          if (!response.ok) {
            throw new HTTPError(401, "Unauthorized", "/login", "POST", new Error("Incorrect username/password."));
          }
          return response.json();
        })
        .then(data => {
            const accessToken = data.response.accessToken;
            // set AccessToken as cookie
            document.cookie = `accessToken=${accessToken}; max-age=${data.response.accessExpiry}; path=/ ; secure; samesite=strict`;
            setAccessToken(accessToken);
            retrieveWeapons(weapons, accessToken);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
  };

  /**
   * Clear the edit list.
   * See Terminal component for use.
   * @return {*} {void}
   */
  const handleClearEdit = () => {
    setEdit(edit => {
      edit.forEach((weapon) => {
        obtainWeapon(weapon.gameId);
      })
      return [];
    });

  }

  const retrieveWeapons = (weapons: Weapon[], accessToken: string) => {
    fetch(`${SERVER_URI}/collection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    })
    .then(response => response.json())
    .then(data => {
      if (!data["response"]) return;

      const response: Weapon[] = data["response"]

      // For each weapon in weapons, check if response has the weapon, if so, update the weapon's isObtained state.
      const updatedWeapons = weapons.map((weapon) => {
        const obtained = response.find((w) => w.gameId === weapon.gameId);
        if (obtained) {
          weapon.isObtained = true;
        }
        return weapon;
      });

      setWeapons([...updatedWeapons]);
      setResult([])

    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  /**
   * Sort the weapons by a key.
   *
   * Key can be "name", "damageType", "rarityNumber", or "".
   * Supports ascending and descending sort.
   * @param {string} key The key to sort the weapons by.
   * @return {*} {void}
   * @callback
  */
  const sortBy = (key: string) => {

    if (key !== "name" && key !== "damageType" && key !== "rarityNumber" && key !== "") {
      console.error("Invalid key");
      return;
    }

    if (result.length <= 1) return;

    if (key === "" || sortMode === `${key}Desc`) {
      const key = "_score";
      const sorted = [...result].sort((a, b) => {
        if (a[key] < b[key]) {
          return -1;
        }
        if (a[key] > b[key]) {
          return 1;
        }
        return 0;
      });

      setResult(sorted);
      setSortMode("");
    }
    else if (sortMode === "" || sortMode !== key) {
      const sorted = [...result].sort((a, b) => {
        if (a[key] < b[key]) {
          return -1;
        }
        if (a[key] > b[key]) {
          return 1;
        }
        return 0;
      });

      setResult(sorted);
      setSortMode(key);
    }
    else if (sortMode === key) {
      const sorted = [...result].sort((a, b) => {
        if (a[key] > b[key]) {
          return -1;
        }
        if (a[key] < b[key]) {
          return 1;
        }
        return 0;
      });

      setResult(sorted);
      setSortMode(`${sortMode}Desc`);
    }
  }

  /**
   * Obtain a weapon.
   *
   * Toggle the weapon's `isObtained` state.
   * If the weapon is being edited, add it to the edit list.
   * If the weapon is undoed, remove it from the edit list.
   * @param {id} id The weapon's gameId (stored in e.currentTarget.id)
   * @return {*} {void}
   * @callback
   */
  const obtainWeapon = (id: string) => {
    const weapon = weapons.find(weapon => weapon.gameId === id);
    const resultWeapon = result.find(weapon => weapon.gameId === id);
    if (weapon && resultWeapon) {
      weapon.isObtained = !weapon.isObtained;
      resultWeapon.isObtained = !resultWeapon.isObtained;

      // If the weapon is being edited, update the edit list.
      // If the weapon is undoed, remove it from the edit list.
      const index = edit.findIndex((w) => w.gameId === weapon.gameId);

      // If the edit & weapon are not in sync, add the weapon to the edit list.
      // If the weapon exists in edit, but is being undoed, remove it from the edit list.
      if (index === -1) {
        // Add a timestamp
        const now = new Date();
        const timestamp = `${now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour12: false, year: '2-digit', month: '2-digit', day:'2-digit', hour: '2-digit', minute: '2-digit', second:'2-digit' })}:${now.getMilliseconds().toString().padStart(3, '0')}`;
        const weaponLog: WeaponLog = {
          ...weapon,
          "Timestamp": timestamp, // Readable
        }
        setEdit([...edit, weaponLog]);
      }
      else {
        const newEdit = [...edit];
        newEdit.splice(index, 1);
        setEdit([...newEdit]);
      }

      setWeapons([...weapons]);
      setResult([...result]);
    }
  }

  /**
   * Delay helper function to save() to avoid rapid saving.
   * Default delay is 500ms.
   * @see `save()` for the main saving function.
   * @return {*} {void}
   * @callback
  */
  const saveChanges = () => {
    // Delay function to avoid rapid saving.
    setSaving(true);
    setTimeout(() => {
      save();
    }, 500);
  }

  /**
   * Save the "edit list" (list of WeaponLogs) to /obtain/.
   *
   * Persist the changes to user's weapon collection to the database.
   * @return {*} {void}
   * @callback
  */
  const save = () => {

    // Send the timestamp, isObtained, and item to the server.
    // The server will handle the rest.

    const data = edit.map((item) => {
      return {
        "gameId": item.gameId,
        "isObtained": item.isObtained,
        "timestamp": item.Timestamp,
      }
    });

    fetch(`${SERVER_URI}/obtain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
      }).then(response => response.json())
      .then(data => {
        console.log('Saved your data!', data);
        setEdit([]);
        setSaving(false);

      }).catch((error) => {
        console.error('Error:', error);
      }
    );
  }

  /**
   * Search for weapons using fuzzy search.
   *
   * Query must be at least 3 characters long.
   * See options for advanced search filters.
   * @see https://fusejs.io/api/options.html
   * @param {string} query The search query acted on weapon's keys (name, damageType, etc.)
   * @return {*} {void}
   * @callback
   */
  const search = useCallback((query: string) => {
    setWeapons(weapons => {
      if (!query || query.length < 3) {
        setResult([]);
        return weapons;
      }

      const options = {
        keys: ['name', 'damageType'],
        includeMatches: true,
        includeScore: true,
        minMatchCharLength: query.length,
        threshold: 1-(SEARCH_THRESHOLD)
      };
      const fuse = new Fuse<Weapon>(weapons, options);
      const response = fuse.search(query);

      const result = response.map((entry) => {

        if (!entry.matches || !entry.score) return {
          ...entry.item,
          "_matched": [],
          "_score": 0,
        }

        const matches: IndexDict = entry.matches.reduce((acc: IndexDict, match) => {
          const key = `${match.key}`;

          // Map all indices
          acc[key] = match.indices.map((indices) => [indices[0], indices[1]]);
          return acc;
        }, {});

        return {
          ...entry.item,
          "_matched": matches,
          "_score": entry.score,
        }
      });
      setResult([...result]);
      return weapons;
    });
  }, []);

  /**
   * Get highlighted text from a string.
   * Must be used in tandem with the IndexDict type & fuse.js (for fuzzy search).
   * @param text The text to be highlighted
   * @param matches The matches from the fuzzy search
   * @param mode The mode to search for (name, damageType, etc.). Subject to change based on Weapon's keys.
   * @return {*} {JSX.Element} The highlighted text
   */
  const getHighlight = (text: string, matches: IndexDict | object, mode: string = "name") => {

    if (!Object.keys(matches).length) return <div>{text}</div>

    const parts = [];
    let lastIndex = 0;
    const indices: IndexDict = matches as IndexDict;

    if (!indices[mode]) return <div>{text}</div>

    indices[mode].forEach(([start, end], index) => {

      // Append non-highlighted text before the match
      parts.push(text.substring(lastIndex, start));

      // Append highlighted text within a span
      parts.push(
        <React.Fragment key={index}>
          <span className="bg-stone-200 text-zinc-500">{text.substring(start, end + 1)}</span>
        </React.Fragment>
      );

      // Update lastIndex to the next position
      lastIndex = end + 1;
    });

    // Append any remaining non-highlighted text after the last match
    parts.push(text.substring(lastIndex));

    return <div className="highlighter">{parts}</div>;
  }


  // Fetch all weapons from /weapons/
  useEffect(() => {
    fetch(`${SERVER_URI}/weapons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then((data: WeaponApiResult) => {
        const weapons: Weapon[] = Object.values(data["response"]).map((weapon) => {
          return {
            ...weapon,
            "isObtained": false,
            "_matched": [],
            "_score": 0,
          }
        });
        setWeapons(weapons);
        return weapons;
      }).then((weapons) => {

        if (document.cookie) {
          const cookies = document.cookie.split(';');
          const accessToken = cookies.find((cookie) => cookie.includes("accessToken="))?.split('=')[1];
          if (accessToken) {
            setAccessToken(accessToken);
            retrieveWeapons(weapons, accessToken);
          }
        }
      })
      .catch(error => console.error('Error:', error));
  }, []);


  // Debounce search query
  useEffect(() => {
    const delay = DEBOUNCE_MSEC;
    const timeout = setTimeout(() => {
      search(query);
    }, delay);

    return () => clearTimeout(timeout);
  }, [query, search]);

  // Lazy load images with Lozad's observer
  useEffect(() => {
    const images = document.querySelectorAll('.lozad');
    images.forEach((image) => {
      image.setAttribute('data-loaded', 'false');
    });
    observe();
  }, [observe]);

  return (
    <div tabIndex={0} ref={focusRef} onKeyDown={(e) => onKeybind(e)} className="flex p-5 items-start justify-center absolute w-max min-h-full h-max focus:outline-none focus:ring-transparent">
      <div className="w-max h-max max-w-xl">

        <div className="fixed animate__animated animate__fadeIn animate__fast bottom-4 left-4 invisible md:visible">
          <div className="flex items-center justify-center text-xs text-stone-400">
            <p className="">{keyBind}</p>
          </div>
        </div>


        { showTerminal && <Terminal accessToken={accessToken} edit={edit} handleClearEdit={handleClearEdit}/>}
        <Login accessToken={accessToken} handleLogin={handleLogin}/>
        <Footer showTerminal={showTerminal} edit={edit}/>
        <div className="fixed">
          <div className={`relative pb-4 mt-32 bg-white flex justify-start`}>
              <label htmlFor="table-search" className="sr-only">Search</label>
              <div className="flex items-center">
                <div className="relative">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input autoFocus onChange={(e)=>onSearch(e)} value={query} type="text" id="table-search" className="block pt-1 pb-1 ps-10 text-sm text-gray-900 border border-gray-200 rounded-lg w-60 bg-gray-50 transition-border duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-300/20" placeholder={`made with ❤  | ${VERSION}`}/>
                </div>
                {!accessToken && <svg fill="#f87171" className="w-4 h-4 ml-3 animate__animated animate__headShake" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <title>Read-only, please log in.</title>
                  <path d="M4 30.016q0 0.832 0.576 1.408t1.44 0.576h20q0.8 0 1.408-0.576t0.576-1.408v-14.016q0-0.832-0.576-1.408t-1.408-0.576v-4q0-2.048-0.8-3.872t-2.144-3.2-3.2-2.144-3.872-0.8q-2.72 0-5.024 1.344t-3.616 3.648-1.344 5.024v4q-0.832 0-1.44 0.576t-0.576 1.408v14.016zM8 28v-9.984h16v9.984h-16zM10.016 14.016v-4q0-2.496 1.728-4.256t4.256-1.76 4.256 1.76 1.76 4.256v4h-12z"></path>
                </svg>}
              </div>
              <div onClick={() => saveChanges()} onMouseEnter={() => setOnSave(true)} onMouseLeave={() => setOnSave(false)} className="cursor-pointer min-w-20 flex justify-end">
                {edit.length > 0 && <div className="animate__animated animate__fadeInUp animate__fast pt-4 text-xs text-stone-400 transition-all duration-300 ease-in-out hover:text-amber-600">{saving ? "saving.." : (onSave ? "wanna save?" : "now editing! ♦")}</div>}
              </div>
          </div>
        </div>
        <div className="mt-44 max-h-[42rem] bg-red overflow-scroll shadow-md sm:rounded-lg transition-all">
          <div className="relative">
              <table className="transition-transform w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-stone-100 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="p-4"></th>
                          <th scope="col" className="px-6 py-3"></th>
                          <th scope="col" onClick={() => sortBy("name")} className={`${(sortMode == "name" || sortMode == "nameDesc") ? "text-stone-900" : "text-gray-700 opacity-50"} select-none px-6 py-3 hover:text-stone-900 hover:opacity-100 cursor-pointer`}>Name</th>
                          <th scope="col" onClick={() => sortBy("damageType")} className={`${(sortMode == "damageType" || sortMode == "damageTypeDesc") ? "text-stone-900" : "text-gray-700 opacity-50"} select-none px-6 py-3 hover:text-stone-900 hover:opacity-100 cursor-pointer`}>
                              Type
                          </th>
                          <th scope="col" onClick={() => sortBy("rarityNumber")} className={`${(sortMode == "rarityNumber" || sortMode == "rarityNumberDesc") ? "text-stone-900" : "text-gray-700 opacity-50"} select-none px-3 py-3 hover:text-stone-900 hover:opacity-100 cursor-pointer`}>
                              Rarity
                          </th>
                          <th scope="col" onClick={() => sortBy("")} className="px-6 py-3 opacity-50 cursor-pointer hover:opacity-100">
                            {(sortMode !== "" && !sortMode.includes("Desc")) ? "▲" : sortMode.includes("Desc") ? "▼" : ""}
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                      {result.map((weapon, index) => {
                        return (
                          <tr key={index} id={weapon["gameId"]} onClick={(e) => obtainWeapon(e.currentTarget.id)} className="animate__animated animate__fadeIn animate__fast bg-white border-b dark:bg-gray-800 cursor-pointer dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-gray-600">
                              <td className="w-4 p-4">
                                  <div className="flex items-center">
                                      { accessToken &&
                                        <div className="absolute flex pointer-events-none items-center justify-center z-10 w-4 h-4 rounded-full bg-stone-100">
                                          <div className={`pointer-events-auto cursor-pointer z-2 w-3 h-3 rounded-full ${weapon["isObtained"] ? 'bg-amber-800 opacity-50 hover:opacity-70' : 'bg-zinc-500 opacity-10 hover:bg-amber-700 hover:opacity-30'}`}/>
                                        </div>
                                      }
                                  </div>
                              </td>
                              <th scope="row" className="py-4 flex items-center justify-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  <img data-src={weapon.imageUri} alt={weapon["gameId"]} className="lozad max-w-10 max-h-10"/>
                              </th>
                              <td className="px-2 py-4">
                                  <div className="flex">
                                    {getHighlight(weapon.name, weapon._matched)}
                                    <div className="px-3 flex flex-col items-center justify-center">
                                      <div className={`px-2 ring-offset-2 ring-2 text-xs flex items-center justify-center ${1.0 - weapon._score > 0.85 ? 'bg-green-200 ring-green-300' : 1.0 - weapon._score > 0.75 ? 'bg-amber-200 ring-amber-300' : 'bg-red-200 ring-red-200' } rounded-full opacity-100`}>
                                        {((1.0 - weapon._score)*100).toFixed(0)}
                                      </div>
                                    </div>
                                  </div>
                              </td>
                              <td className="text-center px-3 py-4">
                                  {getHighlight(weapon.damageType, weapon._matched, "damageType")}
                              </td>
                              <td className="text-center px-3 py-4">
                                  {weapon.rarityNumber}
                              </td>
                              <td className="px-3 py-4">
                                  <a href={weapon.refUri} target="_blank" className="font-medium text-amber-800 opacity-30 hover:opacity-60 hover:text-amber-800">❤</a>
                              </td>
                          </tr>
                        )
                      })}
                  </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
