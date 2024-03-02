
import { WeaponLog } from '../types';
import { VERSION } from '../constants';

interface TerminalProps {
    edit: WeaponLog[];
    showTerminal: boolean;
}


function Footer ({ edit, showTerminal }: TerminalProps) {
  return (
    <>
      {(!showTerminal) &&
      <div className="fixed animate__animated animate__fadeIn animate__fast bottom-4 right-4 invisible md:visible">
          <p className="hover:text-amber-600 cursor-pointer text-xs text-stone-400 dark:text-gray-400">{VERSION} | {new Intl.DateTimeFormat().resolvedOptions().timeZone} | {edit.length}</p>
      </div>}
    </>
  )
}

export default Footer;
