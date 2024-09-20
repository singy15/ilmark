
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

