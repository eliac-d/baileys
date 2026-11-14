const colorEnabled = Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env);
const paint = (code, text) => colorEnabled ? `\x1b[${code}m${text}\x1b[0m` : text;
const cyan = (text) => paint('36', text);
const magenta = (text) => paint('35', text);
const bold = (text) => paint('1', text);

const border = '═'.repeat(38);
const title = 'BAILEYS MOD DIX';
const left = Math.floor((border.length - title.length) / 2);
const inner = title.padStart(left + title.length).padEnd(border.length);

console.log(cyan(`╔${border}╗`));
console.log(`${cyan('║')}${bold(magenta(inner))}${cyan('║')}`);
console.log(cyan(`╚${border}╝`));

import makeWASocket from './Socket/index.js';
export * from '../WAProto/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
export { Dugong } from './Socket/dugong.js';
export { VoipClient, ActiveCall, CallState } from './VoIP/index.js';
export { makeWASocket };
export { downloadContentFromMessage } from './Utils/downloadContent.js';
export default makeWASocket;