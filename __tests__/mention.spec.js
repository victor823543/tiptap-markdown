import { describe, test, expect } from 'vitest';
import { Fragment } from "@tiptap/pm/model";
import { getHTMLFromFragment } from "@tiptap/core";
import { elementFromString } from "../src/util/dom";

// Test our helper functions directly
function serializeMentionHTML(html) {
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

describe('mention node serialization', () => {
    test('extracts data attributes from complex mention HTML', () => {
        const complexMention = `<div data-type="mention" data-id="temporal-id" data-label="New Flashcard Group" data-mention-suggestion-char="@" class="object-mention" contenteditable="false">
            <div class="top-part">
                <span class="title">Untitled</span>
            </div>
            <div class="bottom-part">
                <span class="description">No description</span>
            </div>
        </div>`;

        const result = serializeMentionHTML(complexMention);

        expect(result).toBe('<div data-type="mention" data-id="temporal-id" data-label="New Flashcard Group" data-mention-suggestion-char="@"></div>');
    });

    test('works with simple mention', () => {
        const simpleMention = '<div data-type="mention" data-id="123">Content</div>';
        const result = serializeMentionHTML(simpleMention);

        expect(result).toBe('<div data-type="mention" data-id="123"></div>');
    });

    test('preserves all data attributes', () => {
        const mention = '<div data-type="mention" data-id="123" data-custom="value" data-another="test">Content</div>';
        const result = serializeMentionHTML(mention);

        expect(result).toBe('<div data-type="mention" data-id="123" data-custom="value" data-another="test"></div>');
    });

    test('works with different tag names', () => {
        const spanMention = '<span data-type="mention" data-id="456" class="some-class">Content</span>';
        const result = serializeMentionHTML(spanMention);

        expect(result).toBe('<span data-type="mention" data-id="456"></span>');
    });

    test('ignores non-mention elements', () => {
        const notMention = '<div data-type="other" data-id="456">Content</div>';
        const result = serializeMentionHTML(notMention);

        expect(result).toBe(notMention); // returns unchanged
    });

    test('handles empty data attributes', () => {
        const mentionWithEmptyData = '<div data-type="mention" data-id="" data-label="Test">Content</div>';
        const result = serializeMentionHTML(mentionWithEmptyData);

        expect(result).toBe('<div data-type="mention" data-id="" data-label="Test"></div>');
    });
});