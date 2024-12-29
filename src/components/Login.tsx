import { useState } from 'react';

interface LoginProps {
    accessToken: string;
    handleLogin: (username: string, password: string) => void;
}

function Login({ accessToken, handleLogin} : LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  return (
    <div className="fixed top-0 left-0 pl-5 pt-5">
        <div className="flex items-center justify-center bg-neutral-100 rounded-lg py-5 px-10">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-500" fill="#6b7280" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>at</title>
                            <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208v6.016q0 2.496-1.76 4.224t-4.224 1.76q-2.272 0-3.936-1.472t-1.984-3.68q-1.952 1.152-4.096 1.152-2.176 0-4-1.056t-2.944-2.912-1.056-4.032q0-3.296 2.336-5.632t5.664-2.368 5.664 2.368 2.336 5.632v6.016q0 0.8 0.608 1.408t1.408 0.576q0.8 0 1.408-0.576t0.576-1.408v-6.016q0-3.264-1.6-6.016t-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016 1.6 6.048 4.384 4.352 6.016 1.6h2.016q0.8 0 1.408 0.608t0.576 1.408-0.576 1.408-1.408 0.576h-2.016q-3.264 0-6.208-1.248t-5.12-3.424-3.392-5.12-1.28-6.208zM12 16q0 1.664 1.184 2.848t2.816 1.152 2.816-1.152 1.184-2.848-1.184-2.816-2.816-1.184-2.816 1.184-1.184 2.816z"></path>
                        </svg>
                    </div>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" type="text" className={`${accessToken ? "cursor-not-allowed bg-stone-300 text-stone-500 opacity-70" : ""} block pt-1 pb-1 ps-10 text-sm text-gray-900 border border-gray-200 rounded-lg w-60 bg-gray-50 transition-border duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-300/20`}/>
                </div>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="#6b7280" viewBox="0 0 32 32">
                            <path d="M1.728 20.992q-0.416 1.6 0.416 3.008 0.832 1.44 2.432 1.856t3.040-0.384q0.832-0.48 2.56-1.92t3.168-2.912q-0.608 2.016-0.96 4.192t-0.384 3.168q0 1.664 1.184 2.848t2.816 1.152 2.816-1.152 1.184-2.848q0-0.96-0.384-3.168t-0.928-4.192q1.44 1.504 3.168 2.944t2.528 1.888q1.44 0.832 3.040 0.384t2.432-1.856 0.416-3.008-1.888-2.464q-0.864-0.48-2.944-1.248t-4.064-1.28q2.016-0.512 4.096-1.28t2.912-1.248q1.44-0.832 1.888-2.432t-0.416-3.040q-0.832-1.44-2.432-1.856t-3.040 0.384q-0.832 0.512-2.528 1.92t-3.168 2.912q0.576-1.984 0.928-4.192t0.384-3.168q0-1.632-1.184-2.816t-2.816-1.184-2.816 1.184-1.184 2.816q0 0.992 0.384 3.168t0.96 4.192q-1.44-1.472-3.168-2.88t-2.56-1.952q-1.44-0.8-3.040-0.384t-2.432 1.856-0.416 3.040 1.888 2.432q0.832 0.48 2.912 1.248t4.128 1.28q-2.016 0.512-4.096 1.28t-2.944 1.248q-1.44 0.832-1.888 2.464z"></path>
                        </svg>
                    </div>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className={`${accessToken ? "cursor-not-allowed bg-stone-300 text-stone-500 opacity-70" : ""} block pt-1 pb-1 ps-10 text-sm text-gray-900 border border-gray-200 rounded-lg w-60 bg-gray-50 transition-border duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-300/20`}/>
                </div>
            </div>
            <div className="p-5 rounded-lg ml-1 bg-stone-300 hover:bg-amber-400 cursor-pointer text-xs" onClick={() => handleLogin(username, password)}>

                {accessToken ?
                    <svg className="w-5 h-5 text-gray-500" fill="#6b7280"  viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <title>standby</title>
                        <path d="M2.016 18.016q0 2.848 1.088 5.44t2.976 4.448 4.48 3.008 5.44 1.088 5.44-1.088 4.48-3.008 2.976-4.448 1.12-5.44q0-4.128-2.208-7.488t-5.792-5.088v4.608q1.856 1.408 2.912 3.488t1.088 4.48q0 2.72-1.344 5.024t-3.648 3.616-5.024 1.344q-2.016 0-3.872-0.8t-3.2-2.112-2.144-3.2-0.768-3.872q0-2.4 1.056-4.48t2.944-3.488v-4.608q-3.616 1.728-5.824 5.088t-2.176 7.488zM14.016 14.016q0 0.832 0.576 1.408t1.408 0.576 1.408-0.576 0.608-1.408v-12q0-0.832-0.608-1.408t-1.408-0.608-1.408 0.608-0.576 1.408v12z"></path>
                    </svg> :
                    <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="#6b7280" viewBox="0 0 32 32" version="1.1">
                        <title>alt-paper-plane</title>
                        <path d="M0 14.016l4.768 3.584 21.248-11.584-16 16v9.984l5.984-5.984 8 5.984 8-32z"></path>
                    </svg>
                }
            </div>
        </div>
    </div>
  );
}

export default Login;
