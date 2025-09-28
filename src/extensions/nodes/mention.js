import { Node } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { getHTMLFromFragment } from "@tiptap/core";
import { elementFromString } from "../../util/dom";

const Mention = Node.create({
  name: "mention",
})

export default Mention.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          if(this.editor.storage.markdown.options.html) {
            state.write(serializeMentionHTML(node));
          } else {
            console.warn(`Tiptap Markdown: "${node.type.name}" node is only available in html mode`);
            state.write(`[${node.type.name}]`);
          }
          if(node.isBlock) {
            state.closeBlock(node);
          }
        },
        parse: {
          // handled by markdown-it
        },
      }
    }
  }
});

function serializeMentionHTML(node) {
  const schema = node.type.schema;
  const html = getHTMLFromFragment(Fragment.from(node), schema);

  // Parse the HTML to extract only the data attributes
  const dom = elementFromString(html);
  const element = dom.firstElementChild;

  if (!element) {
    return html; // fallback if parsing fails
  }

  // Check if this is a mention element
  if (element.getAttribute('data-type') !== 'mention') {
    return html; // fallback if not a mention
  }

  // Create a new element with only the data attributes
  const tagName = element.tagName.toLowerCase();
  const cleanElement = `<${tagName}${extractDataAttributes(element)}></${tagName}>`;

  return cleanElement;
}

function extractDataAttributes(element) {
  const dataAttribs = [];

  // Get all attributes and filter for data- attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      dataAttribs.push(`${attr.name}="${attr.value}"`);
    }
  }

  return dataAttribs.length > 0 ? ' ' + dataAttribs.join(' ') : '';
}