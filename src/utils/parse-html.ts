import { parse } from "node-html-parser";
import { JSDOM } from "jsdom";
import type { Frame, Page } from "playwright";

const { document } = new JSDOM(`...`).window;

const tagsToLog = [
  "a",
  "p",
  "span",
  "div",
  "button",
  "label",
  "input",
  "textarea",
  "section",
  "select",
  "option",
  "table",
  "td",
  "th",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "iframe",
];

function createElement(node: any) {
  const elem = document.createElement(node.tagName);

  const dataAttributes = Object.entries(node.attributes).filter(
    (a) =>
      (tagsToLog.includes(node.tagName) &&
        (a[0].startsWith("name") ||
          a[0].startsWith("value") ||
          a[0].startsWith("data-component") ||
          a[0].startsWith("data-name") ||
          a[0].startsWith("aria-") ||
          a[0] === "class" ||
          a[0] === "type" ||
          a[0] === "role")) ||
      a[0] === "href" ||
      a[0] === "id"
  );
  dataAttributes.forEach(([attr, value]) => {
    elem.setAttribute(attr, value);
  });

  return elem;
}

function createTextNode(text: string) {
  return document.createTextNode(text);
}

function isAdsIframe(node: any) {
  const style = node.getAttribute("style") || "";
  const id = node.getAttribute("id") || "";
  return (
    node.getAttribute("height") === 0 ||
    style.includes("display: none") ||
    id.startsWith("google_ads_iframe")
  );
}

async function dfs(node: any, parentElem: any, childFrames: any[] = []) {
  for (const childNode of node.childNodes) {
    if (childNode.nodeType === 1) {
      if (childNode.tagName === "IFRAME") {
        for (let { childFrame, attributes } of childFrames) {
          if (
            Object.entries(attributes).every(
              ([attr, value]) => childNode.getAttribute(attr) === value
            )
          ) {
            if (isAdsIframe(childNode)) continue;

            const childElem = createElement(childNode);
            parentElem.appendChild(childElem);
            const newChildFrame = await toChildFramesWithAttributes(childFrame);
            const bodyNode = await childFrame.locator("body", {
              timeout: 1000,
            });
            const bodyHtml = await bodyNode.innerHTML();
            await dfs(parseFrame(bodyHtml), childElem, newChildFrame);

            break;
          }
        }
      } else {
        const childElem = createElement(childNode);
        parentElem.appendChild(childElem);
        await dfs(childNode, childElem, childFrames);
      }
    } else if (childNode.nodeType === 3) {
      if (!childNode.isWhitespace) {
        const textElem = createTextNode(childNode);
        parentElem.appendChild(textElem);
      }
    }
  }
}

async function toChildFramesWithAttributes(frame: any) {
  const childFramesWithAttributes = [];
  for (let childFrame of frame.childFrames()) {
    const childFrameElement = await childFrame.frameElement();
    const attributes = await childFrameElement.evaluate((node: any) => {
      const attrs = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        // @ts-ignore
        attrs[attr.name] = attr.value;
      }
      return attrs;
    });
    childFramesWithAttributes.push({ childFrame, attributes });
  }
  return childFramesWithAttributes;
}

async function getStructure(frame: Frame) {
  const bodyNode = frame.locator("body");
  const bodyHtml = await bodyNode.innerHTML();
  const node = parseFrame(bodyHtml);

  const rootElem = createElement(node);
  const d = await toChildFramesWithAttributes(frame);
  await dfs(node, rootElem, d);
  return rootElem;
}

function parseFrame(html: string) {
  return parse(html, {
    blockTextElements: {
      script: false,
      noscript: false,
      style: false,
      pre: true,
    },
  });
}

export async function parseSite(page: Page) {
  let mainFrame = page.mainFrame();
  const structure = await getStructure(mainFrame);
  return structure.innerHTML;
}
