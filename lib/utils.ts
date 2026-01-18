import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toErrorMessage(payload: any): string {
  if (!payload) return "Server error";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return payload.join(", ");
  if (typeof payload === "object") {
    return payload.message || payload.error || "Server error";
  }
  return "Server error";
}

export function getLocaleFromPathname() {
  if (typeof window === "undefined") return "ru";
  const match = window.location.pathname.match(/^\/(ru|uz)(\/|$)/);
  return match?.[1] ?? "ru";
}

export const printMe = () =>  console.log(`%c
          _____                _____          
         /\\    \\              |\\    \\         
        /::\\____\\             |:\\____\\        
       /:::/    /             |::|   |        
      /:::/    /              |::|   |        
     /:::/    /               |::|   |        
    /:::/____/                |::|   |        
   /::::\\    \\                |::|   |        
  /::::::\\    \\   _____       |::|___|______  
 /:::/\\:::\\    \\ /\\    \\      /::::::::\\    \\ 
/:::/  \\:::\\    /::\\____\\    /::::::::::\\____\\
\\::/    \\:::\\  /:::/    /   /:::/~~~~/~~      
 \\/____/ \\:::\\/:::/    /   /:::/    /         
          \\::::::/    /   /:::/    /          
           \\::::/    /   /:::/    /           
           /:::/    /    \\::/    /            
          /:::/    /      \\/____/             
         /:::/    /                           
        /:::/    /                            
        \\::/    /                             
         \\/____/             
         
         
Stop debugging my code and start hiring me!        
                                              
\n%chttps://github.com/happy2111
`,
  "color:#00ffcc; font-size:12px; font-family:monospace;",
  "color:#4ea1ff; font-size:12px; font-family:monospace; text-decoration:underline;");


