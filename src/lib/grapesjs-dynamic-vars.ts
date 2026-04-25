// import type { Editor } from "grapesjs"

// export interface DynamicVarsPluginOptions {
//   variables: { name: string; value: string }[]
// }

// // 1. Define a strict type so we don't have to use 'any'
// interface GrapesRTE {
//   insertHTML(html: string): void
// }

// export default function dynamicVariablesPlugin(
//   editor: Editor,
//   options: DynamicVarsPluginOptions
// ) {
//   const variables =
//     options.variables && options.variables.length > 0
//       ? options.variables
//       : [{ name: "⚠️ No Variables", value: "" }]

//   const optionsHtml = variables
//     .map((v) => `<option value="${v.value}" style="padding: 5px 10px; color: black;">${v.name}</option>`)
//     .join("")

//   const selectHtml = `
//     <select class="gjs-dynamic-var-select" style="
//           appearance: none;
//       max-width: 100%;
//     ">
//       <option value="" disabled selected style="padding: 5px 10px; color: black;">{}</option>
//       ${optionsHtml}
//     </select>
//   `

//   editor.on("load", () => {
//     let activeRte: GrapesRTE | null = null

//     editor.on("rte:enable", (_view: unknown, rte: GrapesRTE) => {
//       activeRte = rte

//       requestAnimationFrame(() => {
//         const toolbar = document.querySelector(".gjs-rte-toolbar")
//         if (!toolbar) return

//         const selects = toolbar.querySelectorAll(".gjs-dynamic-var-select")
//         selects.forEach((sel) => {
//           // Type casting the DOM node safely
//           const fresh = sel.cloneNode(true) as HTMLSelectElement
//           sel.parentNode?.replaceChild(fresh, sel)

//           fresh.addEventListener("mousedown", (e) => e.stopPropagation())
//           fresh.addEventListener("change", (e) => {
//             e.stopPropagation()
//             const value = (e.target as HTMLSelectElement).value
//             if (value && activeRte) {
//               activeRte.insertHTML(value)
//             }
//             requestAnimationFrame(() => {
//               fresh.value = ""
//             })
//           })
//         })
//       })
//     })

//     editor.on("rte:disable", () => {
//       activeRte = null
//     })

//     // Construct the action object using Record<string, unknown> to satisfy TypeScript
//     const rteAction: Record<string, unknown> = {
//       icon: selectHtml,
//       event: "change",
//       result: () => {
//         // handled via the DOM listener above
//       },
//       update: (_rte: unknown, node: HTMLElement | undefined) => {
//         // Safely check if 'node' exists and has a querySelector method
//         if (node && typeof node.querySelector === "function") {
//           const sel = node.querySelector(
//             ".gjs-dynamic-var-select"
//           ) as HTMLSelectElement | null
//           if (sel) sel.value = ""
//         }
//       },
//     }

//     editor.RichTextEditor.add("dynamic-vars", rteAction)
//   })
// }

import type { Editor } from "grapesjs"

export interface DynamicVarsPluginOptions {
  variables: { name: string; value: string }[]
}

interface GrapesRTE {
  insertHTML(html: string): void
}

export default function dynamicVariablesPlugin(
  editor: Editor,
  options: DynamicVarsPluginOptions
) {
  const variables = options.variables?.length
    ? options.variables
    : [{ name: "⚠️ No Variables", value: "" }]

  const dropdownHtml = `
    <div class="gjs-dynamic-dropdown relative text-xs">
      
      <button 
        class="gjs-dynamic-btn px-2 py-1 rounded "
      >
        {}
      </button>

      <div 
        class="gjs-dynamic-menu hidden absolute left-0 mt-1 w-40 bg-white border rounded shadow-lg z-999"
      >
        ${variables
          .map(
            (v) => `
            <div 
  class="gjs-dynamic-item px-3 py-2 cursor-pointer hover:bg-gray-100 text-black"
  data-value="${v.value}"
>
  ${v.name}
</div>
          `
          )
          .join("")}
      </div>

    </div>
  `

  editor.on("load", () => {
    let activeRte: GrapesRTE | null = null

    editor.on("rte:enable", (_view: unknown, rte: GrapesRTE) => {
      activeRte = rte

      requestAnimationFrame(() => {
        const toolbar = document.querySelector(".gjs-rte-toolbar")
        if (!toolbar) return

        const dropdowns = toolbar.querySelectorAll(".gjs-dynamic-dropdown")

        dropdowns.forEach((dd) => {
          const fresh = dd.cloneNode(true) as HTMLElement
          dd.parentNode?.replaceChild(fresh, dd)

          const btn = fresh.querySelector(".gjs-dynamic-btn") as HTMLElement
          const menu = fresh.querySelector(".gjs-dynamic-menu") as HTMLElement
          const items = fresh.querySelectorAll(".gjs-dynamic-item")

          // Toggle
          btn.addEventListener("mousedown", (e) => e.stopPropagation())
          btn.addEventListener("click", (e) => {
            e.stopPropagation()
            menu.classList.toggle("hidden")
          })

          // Select item
          items.forEach((item) => {
            item.addEventListener("mousedown", (e) => e.stopPropagation())
            item.addEventListener("click", (e) => {
              e.stopPropagation()
              const value = (item as HTMLElement).dataset.value
              if (value && activeRte) {
                activeRte.insertHTML(value)
              }
              menu.classList.add("hidden")
            })
          })

          // Close outside
          document.addEventListener("click", () => {
            menu.classList.add("hidden")
          })
        })
      })
    })

    editor.on("rte:disable", () => {
      activeRte = null
    })

    editor.RichTextEditor.add("dynamic-vars", {
      icon: dropdownHtml,
      event: "",
      result: () => {},
    })
  })
}
