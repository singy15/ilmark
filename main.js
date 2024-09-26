
// import { Editor, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { Crepe } from '@milkdown/crepe';
import "@milkdown/crepe/theme/common/style.css";
// import "@milkdown/crepe/theme/frame.css";
// import '@milkdown/theme-nord/style.css';
import "@milkdown/crepe/theme/nord.css";

import "./style.css";

import { marked } from "marked";


let storageBaseKey = "jspec-editor";

function getStorage(key, defaultValue) {
  let val = localStorage.getItem(`${storageBaseKey}/${key}`);
  if(val === "undefined" || val === "null" || val == null || val === undefined) {
    return defaultValue;
  } else {
    return JSON.parse(val);
  }
}

function setStorage(key, obj) {
  localStorage.setItem(`${storageBaseKey}/${key}`, JSON.stringify(obj));
}

let globalFSHandle;

function writeLog() {}

async function writeFile(fileHandle, contents) {
  const writable = await fileHandle.createWritable();
  // await writable.truncate(0);
  await writable.write(contents);
  await writable.close();
}

async function saveFile(contents, handle = null) {
  try {
    if (!handle) {
      handle = await window.showSaveFilePicker({
        types: [
          {
            description: "Markdown document",
            accept: {
              "text/plain": [".md"],
            },
          },
        ],
      });
    }
    await writeFile(handle, contents);
    return handle;
  } catch (ex) {
    const msg = "failed to save";
    console.error(msg, ex);
    return false;
  }
}


async function openFile() {
  const result = {
    handle: null,
    text: ""
  };

  /** @type FileSystemHandle */
  let fileHandle;
  try {
    [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Markdown document",
          accept: {
            "text/plain": [".md"],
          },
        },
      ],
    });
    globalFSHandle = fileHandle;
    result.handle = fileHandle;
  } catch (ex) {
    console.error("failed to fetch file", ex);
    return false;
  }

  const file = await fileHandle.getFile();
  try {
    const text = await file.text();
    result.text = text;
    return result;
  } catch (ex) {
    console.error("failed to get content", ex);
    return false;
  }
}

async function reloadFile() {
  const result = {
    handle: null,
    text: ""
  };

  /** @type FileSystemHandle */
  let fileHandle;
  try {
    fileHandle = globalFSHandle;
    result.handle = fileHandle;
  } catch (ex) {
    console.error("failed to fetch file", ex);
    return false;
  }

  const file = await fileHandle.getFile();
  try {
    const text = await file.text();
    result.text = text;
    return result;
  } catch (ex) {
    console.error("failed to get content", ex);
    return false;
  }
}

function isNativeFileSystemSupported() {
  // eslint-disable-next-line no-undef
  return "showOpenFilePicker" in window;
}

async function overwrite() {
  if (!nativeFSSupported) {
    return;
  }

  if(!globalFSHandle) {
    return;
  }

  clearTimeout(globalOverwriteTimeout);
  globalOverwriteTimeout = setTimeout(async function() {
      const fsHandle = await saveFile(
        serializeSource(),
        globalFSHandle
      );
      if (fsHandle) {
        globalFSHandle = fsHandle;
        writeLog("saved");
      } else {
        writeLog("failed to save");
      }
    },
    3000);
}

async function saveNew() {
  if (!nativeFSSupported) {
    alert("nfs not supported");
    return;
  }

  const fsHandle = await saveFile(
    serializeSource(),
    null
  );
  if (fsHandle) {
    globalFSHandle = fsHandle;
    writeLog("saved");
  } else {
    writeLog("failed to save");
  }
}

async function saveOverwrite(content) {
  if (!nativeFSSupported) {
    alert("nfs not supported");
    return;
  }

  const fsHandle = await saveFile(
    content,
    globalFSHandle
  );
  if (fsHandle) {
    globalFSHandle = fsHandle;
    writeLog("saved");
  } else {
    writeLog("failed to save");
  }
}

const nativeFSSupported = isNativeFileSystemSupported();
writeLog(`support for nfs: ${(nativeFSSupported) ? "yes" : "no"}`);


// * `frame`
// * `classic`
// * `nord`
// * `frame-dark`
// * `classic-dark`
// * `nord-dark`


// const editor = Editor.make()
//     .config((ctx) => {
//         ctx.set(defaultValueCtx, '');
//     })
//     .use(nord)
//     .use(commonmark)
//     .create();

// const editor = Editor.make()
//     // .config((ctx) => {
//     //     ctx.set(defaultValueCtx, '');
//     // })
//     // .use(nord)
//     .use(commonmark)
//     .use(Crepe())
//     .create();

var cr = null;
var editor = null;


function createCrepe(initialValue) {
  if(cr != null) { cr.destroy(); }

  cr = new Crepe({
    root: document.getElementById("editor"),
    defaultValue: initialValue,
    features: {
      "Crepe.Feature.CodeMirror": true
    }
  });

  cr.create().then((e) => {
    console.log("editor created", e);
    editor = e;
    // e.config(nord)
    window.editor = e;
  });

  window.cr = cr;
}

createCrepe(`# The example
## About
This is example doc.
`);

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
          createCrepe(content);
        };
        reader.readAsText(file);
    }
});

document.getElementById('saveButton').addEventListener('click', () => {
    const content = cr.getMarkdown();
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.md';
    link.click();
});

document.getElementById('saveButton2').addEventListener('click', () => {
    const content = cr.getMarkdown();
    const html = marked.parse(content);
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.html';
    link.click();
  console.log(html);
});

