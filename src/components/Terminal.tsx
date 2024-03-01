import React, { useState, useEffect, useRef } from "react";
import { WeaponLog } from "../types";

interface TerminalProps {
    edit: WeaponLog[];
}

function Terminal({ edit }: TerminalProps) {

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
                "/help: Lists all possible commands in terminal.",
                "/obtain [weapon_name]: Toggle obtain flag for weapon.",
                "/ping: Check if terminal is responsive.",
                "/clear: Clear terminal."]);
        } else if (query === "/clear") {
            setCommands([]);
        } else if (query === "/ping") {
            setCommands([...commands, "Pong! Yep, it's working!"]);
        }
        setQuery("");
    }

    return (
         <div className={`animate__animated animate__fadeInRight fixed flex flex-col items-end justify-end top-0 right-0 w-1/4 h-full bg-neutral-100 invisible xl:visible`}>
          <div className="w-full p-5">
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
                        <p className="whitespace-nowrap">➟</p>
                      <p className="whitespace-nowrap overflow-hidden text-ellipsis pl-1">{command}</p>
                    </div>
                  </div>
                )
              })}
            </span>
          </div>
          <div className="h-10 w-full p-2 bg-zinc-200 text-stone-800 text-sm">
            <div className="flex items-center">
              <p className="text-stone-500 px-3">$</p>
              <input id="terminal" ref={focusRef} onKeyDown={(e) => onCommand(e)} onChange={(e) => onType(e)} type="text" className="w-full h-full bg-transparent focus:outline-none focus:ring-0" placeholder="Need an assist?" value={query}/>
            </div>
          </div>
        </div>
    );
}

export default Terminal;
