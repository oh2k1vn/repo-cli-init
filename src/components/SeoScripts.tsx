'use client';

import { useEffect } from 'react';

interface SeoScriptsProps {
  header?: string;
  bodyStart?: string;
  bodyEnd?: string;
}

export function SeoScripts({ header, bodyStart, bodyEnd }: SeoScriptsProps) {
  useEffect(() => {
    const injectHtml = (html: string | undefined, target: 'head' | 'body-start' | 'body-end') => {
      if (!html) return;

      const temp = document.createElement('div');
      temp.innerHTML = html;

      const frag = document.createDocumentFragment();
      const scriptNodes: HTMLScriptElement[] = [];

      Array.from(temp.childNodes).forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const originalScript = node as HTMLScriptElement;
          const script = document.createElement('script');
          
          // Copy all attributes
          Array.from(originalScript.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          
          // Copy the script contents
          script.innerHTML = originalScript.innerHTML;
          scriptNodes.push(script);
        } else {
          // Clone other nodes (link, style, div, iframe, etc.)
          frag.appendChild(node.cloneNode(true));
        }
      });

      // Insert scripts and other elements based on target destination
      if (target === 'head') {
        if (frag.childNodes.length > 0) {
          document.head.appendChild(frag);
        }
        scriptNodes.forEach((script) => {
          document.head.appendChild(script);
        });
      } else if (target === 'body-start') {
        // Body-start means insert at the very beginning of document.body
        const body = document.body;
        const firstChild = body.firstChild;
        
        scriptNodes.forEach((script) => {
          body.insertBefore(script, firstChild);
        });
        if (frag.childNodes.length > 0) {
          body.insertBefore(frag, firstChild);
        }
      } else if (target === 'body-end') {
        if (frag.childNodes.length > 0) {
          document.body.appendChild(frag);
        }
        scriptNodes.forEach((script) => {
          document.body.appendChild(script);
        });
      }
    };

    injectHtml(header, 'head');
    injectHtml(bodyStart, 'body-start');
    injectHtml(bodyEnd, 'body-end');
  }, [header, bodyStart, bodyEnd]);

  return null;
}
