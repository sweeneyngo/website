import React, { useState, useEffect, useRef } from "react";
import { WeaponLog } from "../types";

interface TerminalProps {
    accessToken: string;
    edit: WeaponLog[];
    handleClearEdit: () => void;
}

const queries = ["/help", "/loggedin", "/clearall", "/ping", "/clear"];

function Terminal({ accessToken, edit, handleClearEdit }: TerminalProps) {

    const [commands, setCommands] = useState<string[]>(["Welcome to the terminal!", "For a list of commands, type /help.", "Want to know more? Follow me at @ifui0!"]);
    const [query, setQuery] = useState<string>("");
    const focusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        focusRef.current?.focus();
    }, []);

    const onType = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }

    const onCommand = (e: React.KeyboardEvent<HTMLElement>) => {


        if (e.ctrlKey && e.key === "l") {
            e.preventDefault();
            setCommands([]);
            return;
        }

        if (!(e.key === "Enter")) return;

        if (query === "/help") {
            setCommands([...commands,
                `${query}`,
                "/help: Lists all possible commands in terminal.",
                "/loggedin: Check if you are logged in.",
                "/clearall: Clear all edited weapons.",
                "/ping: Check if terminal is responsive.",
                "/clear: Clear terminal."]);
        } else if (query === "/clear") {
          setCommands([]);
        } else if (query === "/ping") {
          setCommands([...commands,
            `${query}`,
            "Pong! Yep, it's working!"]);
        } else if (query === "/loggedin") {
          setCommands([...commands,
            `${query}`,
            `You are ${accessToken === "" ? "NOT" : ""} logged in!`]);
        } else if (query === "/clearall") {
          handleClearEdit();
          setCommands([...commands,
            `${query}`,
            "All weapons have been cleared."]);
        }
        setQuery("");
    }

    return (
         <div className={`animate__animated animate__fadeInRight fixed flex flex-col top-0 right-0 w-1/4 h-full py-4 pt-5 pr-10 invisible xl:visible`}>
          <div className="w-full p-5 h-full flex flex-col justify-end rounded-t-lg bg-neutral-100">
             <div className="text-xs py-2">
              {edit.map((weapon, index) => {
                return (
                  <div key={index} className="animate__animated animate__fadeInUp animate__fast flex justify-between items-center text-stone-400">
                    <div className="flex">
                      <p className="whitespace-nowrap">{`[${weapon.Timestamp}]`}</p>
                      <p className="whitespace-nowrap overflow-hidden text-ellipsis pl-1">{weapon.name}:</p>
                    </div>
                    <p className="pl-1">{weapon.isObtained ? "✅" : "❌"}</p>
                  </div>
                )
              })}
            </div>
            <span className="text-xs">
              {commands.map((command, index) => {
                return (
                  <div key={index} className="animate__animated animate__fadeInUp animate__fast flex justify-between py-px text-stone-600">
                    <div className="flex">
                        <p className={`whitespace-nowrap ${queries.includes(command) ? "opacity-50" : ""}`}>➟</p>
                      <p className={`whitespace-nowrap overflow-hidden text-ellipsis pl-1 ${queries.includes(command) ? "opacity-50" : ""}`}>{command}</p>
                    </div>
                  </div>
                )
              })}
            </span>
          </div>
          <div className="h-10 w-full p-2 bg-zinc-200 rounded-b-lg text-stone-800 text-sm">
            <div className="flex items-center">
              <p className="text-stone-500 px-3">$</p>
              <input id="terminal" ref={focusRef} onKeyDown={(e) => onCommand(e)} onChange={(e) => onType(e)} type="text" className="w-full h-full bg-transparent focus:outline-none focus:ring-0" placeholder="Need an assist?" value={query}/>
            </div>
          </div>
        </div>
    );
}

export default Terminal;
