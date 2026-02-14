import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  describe('basic tag handling', () => {
    it('preserves allowed tags', () => {
      expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
      expect(sanitizeHtml('<em>italic</em>')).toBe('<em>italic</em>');
      expect(sanitizeHtml('<strong>strong</strong>')).toBe('<strong>strong</strong>');
    });

    it('preserves nested allowed tags', () => {
      expect(sanitizeHtml('<p><b>bold</b> text</p>')).toBe('<p><b>bold</b> text</p>');
    });

    it('preserves self-closing tags', () => {
      expect(sanitizeHtml('<br />')).toBe('<br />');
      expect(sanitizeHtml('<hr />')).toBe('<hr />');
    });

    it('removes disallowed tags but keeps content', () => {
      expect(sanitizeHtml('<blink>text</blink>')).toBe('text');
      expect(sanitizeHtml('<marquee>scrolling</marquee>')).toBe('scrolling');
    });

    it('handles plain text without tags', () => {
      expect(sanitizeHtml('hello world')).toBe('hello world');
    });

    it('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('normalizes tag names to lowercase', () => {
      expect(sanitizeHtml('<B>bold</B>')).toBe('<b>bold</b>');
      expect(sanitizeHtml('<STRONG>text</STRONG>')).toBe('<strong>text</strong>');
    });
  });

  describe('script removal', () => {
    it('removes script tags and their content', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('');
    });

    it('removes script tags with attributes', () => {
      expect(sanitizeHtml('<script type="text/javascript">alert(1)</script>')).toBe('');
    });

    it('removes self-closing script tags', () => {
      expect(sanitizeHtml('<script src="evil.js" />')).toBe('');
    });

    it('removes script tags with line breaks in content', () => {
      expect(sanitizeHtml('<script>\nalert("xss")\n</script>')).toBe('');
    });

    it('removes multiple script tags', () => {
      expect(sanitizeHtml('before<script>a</script>middle<script>b</script>after'))
        .toBe('beforemiddleafter');
    });
  });

  describe('style removal', () => {
    it('removes style tags and their content', () => {
      expect(sanitizeHtml('<style>body { display: none; }</style>')).toBe('');
    });

    it('removes style tags with attributes', () => {
      expect(sanitizeHtml('<style type="text/css">.x { color: red; }</style>')).toBe('');
    });
  });

  describe('event handler stripping', () => {
    it('removes onclick handler', () => {
      expect(sanitizeHtml('<div onclick="alert(1)">text</div>')).toBe('<div>text</div>');
    });

    it('removes onerror handler', () => {
      expect(sanitizeHtml('<img src="x.png" onerror="alert(1)" />')).toBe('<img src="x.png" />');
    });

    it('removes onload handler', () => {
      expect(sanitizeHtml('<div onload="alert(1)">text</div>')).toBe('<div>text</div>');
    });

    it('removes onmouseover handler', () => {
      expect(sanitizeHtml('<span onmouseover="alert(1)">hover</span>')).toBe('<span>hover</span>');
    });

    it('removes onfocus handler', () => {
      expect(sanitizeHtml('<div onfocus="alert(1)">text</div>')).toBe('<div>text</div>');
    });

    it('removes multiple event handlers from one tag', () => {
      const input = '<div onclick="a()" onmouseover="b()" class="safe">text</div>';
      expect(sanitizeHtml(input)).toBe('<div class="safe">text</div>');
    });
  });

  describe('dangerous URL scheme stripping', () => {
    it('removes javascript: URLs from href', () => {
      expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>'))
        .toBe('<a>click</a>');
    });

    it('removes javascript: URLs with spaces', () => {
      expect(sanitizeHtml('<a href="  javascript:alert(1)">click</a>'))
        .toBe('<a>click</a>');
    });

    it('removes vbscript: URLs', () => {
      expect(sanitizeHtml('<a href="vbscript:MsgBox(1)">click</a>'))
        .toBe('<a>click</a>');
    });

    it('removes data: URLs from src', () => {
      expect(sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>" />'))
        .toBe('<img />');
    });

    it('allows http/https URLs', () => {
      expect(sanitizeHtml('<a href="https://example.com">link</a>'))
        .toBe('<a href="https://example.com">link</a>');
    });

    it('allows relative URLs', () => {
      expect(sanitizeHtml('<a href="/page">link</a>'))
        .toBe('<a href="/page">link</a>');
    });

    it('allows mailto URLs', () => {
      expect(sanitizeHtml('<a href="mailto:user@example.com">email</a>'))
        .toBe('<a href="mailto:user@example.com">email</a>');
    });
  });

  describe('attribute filtering', () => {
    it('keeps allowed global attributes', () => {
      expect(sanitizeHtml('<div class="container" id="main">text</div>'))
        .toBe('<div class="container" id="main">text</div>');
    });

    it('keeps title attribute', () => {
      expect(sanitizeHtml('<span title="tooltip">text</span>'))
        .toBe('<span title="tooltip">text</span>');
    });

    it('removes disallowed attributes', () => {
      expect(sanitizeHtml('<div style="color:red">text</div>'))
        .toBe('<div>text</div>');
    });

    it('keeps tag-specific attributes', () => {
      expect(sanitizeHtml('<a href="https://example.com" target="_blank" rel="noopener">link</a>'))
        .toBe('<a href="https://example.com" target="_blank" rel="noopener">link</a>');
    });

    it('keeps img attributes', () => {
      expect(sanitizeHtml('<img src="photo.jpg" alt="Photo" width="100" height="50" />'))
        .toBe('<img src="photo.jpg" alt="Photo" width="100" height="50" />');
    });

    it('keeps table cell attributes', () => {
      expect(sanitizeHtml('<td colspan="2" rowspan="3">cell</td>'))
        .toBe('<td colspan="2" rowspan="3">cell</td>');
    });

    it('keeps th scope attribute', () => {
      expect(sanitizeHtml('<th scope="col">Header</th>'))
        .toBe('<th scope="col">Header</th>');
    });

    it('keeps ol attributes', () => {
      expect(sanitizeHtml('<ol start="5" type="a"><li>item</li></ol>'))
        .toBe('<ol start="5" type="a"><li>item</li></ol>');
    });

    it('keeps blockquote cite attribute', () => {
      expect(sanitizeHtml('<blockquote cite="https://source.com">quote</blockquote>'))
        .toBe('<blockquote cite="https://source.com">quote</blockquote>');
    });

    it('keeps details open attribute', () => {
      expect(sanitizeHtml('<details open><summary>Title</summary>Content</details>'))
        .toBe('<details open=""><summary>Title</summary>Content</details>');
    });

    it('escapes attribute values with special characters', () => {
      expect(sanitizeHtml('<div class="a&b">text</div>'))
        .toBe('<div class="a&amp;b">text</div>');
    });

    it('escapes double quotes in attribute values', () => {
      expect(sanitizeHtml('<div title=\'say "hello"\'>text</div>'))
        .toBe('<div title="say &quot;hello&quot;">text</div>');
    });
  });

  describe('comprehensive tag list', () => {
    it('allows heading tags', () => {
      expect(sanitizeHtml('<h1>H1</h1>')).toBe('<h1>H1</h1>');
      expect(sanitizeHtml('<h2>H2</h2>')).toBe('<h2>H2</h2>');
      expect(sanitizeHtml('<h3>H3</h3>')).toBe('<h3>H3</h3>');
      expect(sanitizeHtml('<h4>H4</h4>')).toBe('<h4>H4</h4>');
      expect(sanitizeHtml('<h5>H5</h5>')).toBe('<h5>H5</h5>');
      expect(sanitizeHtml('<h6>H6</h6>')).toBe('<h6>H6</h6>');
    });

    it('allows list tags', () => {
      expect(sanitizeHtml('<ul><li>item</li></ul>')).toBe('<ul><li>item</li></ul>');
      expect(sanitizeHtml('<ol><li>item</li></ol>')).toBe('<ol><li>item</li></ol>');
    });

    it('allows definition list tags', () => {
      expect(sanitizeHtml('<dl><dt>term</dt><dd>definition</dd></dl>'))
        .toBe('<dl><dt>term</dt><dd>definition</dd></dl>');
    });

    it('allows table tags', () => {
      const table = '<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>D</td></tr></tbody><tfoot><tr><td>F</td></tr></tfoot></table>';
      expect(sanitizeHtml(table)).toBe(table);
    });

    it('allows text formatting tags', () => {
      expect(sanitizeHtml('<del>deleted</del>')).toBe('<del>deleted</del>');
      expect(sanitizeHtml('<ins>inserted</ins>')).toBe('<ins>inserted</ins>');
      expect(sanitizeHtml('<mark>highlighted</mark>')).toBe('<mark>highlighted</mark>');
      expect(sanitizeHtml('<sub>sub</sub>')).toBe('<sub>sub</sub>');
      expect(sanitizeHtml('<sup>sup</sup>')).toBe('<sup>sup</sup>');
      expect(sanitizeHtml('<small>small</small>')).toBe('<small>small</small>');
      expect(sanitizeHtml('<s>strikethrough</s>')).toBe('<s>strikethrough</s>');
      expect(sanitizeHtml('<u>underline</u>')).toBe('<u>underline</u>');
    });

    it('allows code-related tags', () => {
      expect(sanitizeHtml('<code>code</code>')).toBe('<code>code</code>');
      expect(sanitizeHtml('<pre>preformatted</pre>')).toBe('<pre>preformatted</pre>');
      expect(sanitizeHtml('<kbd>Ctrl+C</kbd>')).toBe('<kbd>Ctrl+C</kbd>');
      expect(sanitizeHtml('<samp>output</samp>')).toBe('<samp>output</samp>');
      expect(sanitizeHtml('<var>x</var>')).toBe('<var>x</var>');
    });

    it('removes dangerous tags', () => {
      expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('');
      expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('');
      expect(sanitizeHtml('<embed src="evil.swf" />')).toBe('');
      expect(sanitizeHtml('<form action="evil.com"><input /></form>')).toBe('');
    });
  });

  describe('custom options', () => {
    it('allows custom tag set', () => {
      const options = { allowedTags: new Set(['b', 'i']) };
      expect(sanitizeHtml('<b>bold</b> <i>italic</i> <em>em</em>', options))
        .toBe('<b>bold</b> <i>italic</i> em');
    });

    it('allows custom attribute set', () => {
      const options = {
        allowedAttributes: {
          '*': new Set(['data-id']),
        },
      };
      expect(sanitizeHtml('<div data-id="123" class="foo">text</div>', options))
        .toBe('<div data-id="123">text</div>');
    });

    it('uses custom options together', () => {
      const options = {
        allowedTags: new Set(['span']),
        allowedAttributes: {
          '*': new Set<string>(),
          'span': new Set(['data-tooltip']),
        },
      };
      expect(sanitizeHtml('<span data-tooltip="help" class="x">text</span>', options))
        .toBe('<span data-tooltip="help">text</span>');
    });
  });

  describe('edge cases', () => {
    it('handles HTML comments by preserving them', () => {
      const result = sanitizeHtml('before<!-- comment -->after');
      // Comments are not tags and pass through
      expect(result).toBe('before<!-- comment -->after');
    });

    it('handles unclosed tags', () => {
      // Unclosed tag treated as opening tag
      const result = sanitizeHtml('<p>paragraph without close');
      expect(result).toBe('<p>paragraph without close');
    });

    it('handles nested disallowed tags preserving inner text', () => {
      expect(sanitizeHtml('<div><blink><marquee>text</marquee></blink></div>'))
        .toBe('<div>text</div>');
    });

    it('handles mixed content with scripts and allowed tags', () => {
      const input = '<p>Hello</p><script>alert(1)</script><b>world</b>';
      expect(sanitizeHtml(input)).toBe('<p>Hello</p><b>world</b>');
    });

    it('handles entities in text', () => {
      expect(sanitizeHtml('<p>&amp; &lt; &gt;</p>')).toBe('<p>&amp; &lt; &gt;</p>');
    });

    it('handles multiple spaces in tags', () => {
      expect(sanitizeHtml('<b  class="x"  >text</b >')).toBe('<b class="x">text</b>');
    });

    it('handles case-insensitive script removal', () => {
      expect(sanitizeHtml('<SCRIPT>alert(1)</SCRIPT>')).toBe('');
      expect(sanitizeHtml('<Script>alert(1)</Script>')).toBe('');
    });

    it('handles case-insensitive style removal', () => {
      expect(sanitizeHtml('<STYLE>.x{color:red}</STYLE>')).toBe('');
    });

    it('handles boolean attributes', () => {
      // 'open' is a boolean attribute for details
      expect(sanitizeHtml('<details open><summary>S</summary></details>'))
        .toBe('<details open=""><summary>S</summary></details>');
    });

    it('preserves text around removed tags', () => {
      expect(sanitizeHtml('before <blink>middle</blink> after'))
        .toBe('before middle after');
    });

    it('handles deeply nested allowed tags', () => {
      const input = '<div><p><b><em><code>deep</code></em></b></p></div>';
      expect(sanitizeHtml(input)).toBe(input);
    });
  });

  describe('XSS prevention patterns', () => {
    it('blocks javascript: in href', () => {
      expect(sanitizeHtml('<a href="javascript:void(0)">link</a>')).toBe('<a>link</a>');
    });

    it('blocks JAVASCRIPT: (case variation) in href', () => {
      expect(sanitizeHtml('<a href="JAVASCRIPT:alert(1)">link</a>')).toBe('<a>link</a>');
    });

    it('blocks img onerror XSS', () => {
      expect(sanitizeHtml('<img src="x" onerror="alert(1)" />'))
        .toBe('<img src="x" />');
    });

    it('blocks svg/math tags', () => {
      expect(sanitizeHtml('<svg onload="alert(1)"><circle></circle></svg>'))
        .toBe('');
    });

    it('blocks data: URLs in img src', () => {
      expect(sanitizeHtml('<img src="data:image/svg+xml,<script>alert(1)</script>" />'))
        .toBe('<img />');
    });

    it('blocks style attribute (CSS injection)', () => {
      expect(sanitizeHtml('<div style="background:url(javascript:alert(1))">text</div>'))
        .toBe('<div>text</div>');
    });

    it('blocks form elements', () => {
      expect(sanitizeHtml('<form><input type="text" /><button>Submit</button></form>'))
        .toBe('Submit');
    });

    it('blocks meta refresh', () => {
      expect(sanitizeHtml('<meta http-equiv="refresh" content="0;url=evil.com" />'))
        .toBe('');
    });

    it('blocks base tag', () => {
      expect(sanitizeHtml('<base href="evil.com" />')).toBe('');
    });

    it('blocks link tag', () => {
      expect(sanitizeHtml('<link rel="stylesheet" href="evil.css" />')).toBe('');
    });
  });
});
