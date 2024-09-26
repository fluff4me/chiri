# chiri
A stylesheet language named after yours truly, focused on reusable mixins for styling components.

## Example

```sh
npm install chiri
chiri index.chiri
```

```chiri
; index.chiri

; define mixins (they can be single-line or multi-line)
%borderless:
	border: none
%border-1: border: 1px solid
%border-2: border: 2px solid

%text-purple: colour: rebeccapurple
%text-blue:
	colour: blue

; apply them to components
.button-main:
	%borderless
	%text-purple
	
.button-secondary:
	%border-2
	%text-blue
```

The output of the above code is the following, but the js and css files are minified:

```css
/* index.css */

.borderless { border: none }
/* border-1 was never used, so it's skipped */
.border-2 { border: 2px solid }
.text-purple { color: rebeccapurple }
.text-blue { color: blue }
```

```js
// index.js

const ChiriClasses = {
    "button-main": ["borderless", "text-purple"],
    "button-secondary": ["border-2", "text-blue"]
};

export default ChiriClasses;
```

```ts
// index.d.ts

declare const ChiriClasses: {
	"button-main": string[];
	"button-secondary": string[];
};

export default ChiriClasses;
export as namespace ChiriClasses;
```

## Generated Class Ordering
If mixins are compiled into CSS classes, you might be wondering whether you have to constantly keep the declaration order of your mixins in mind so that components appear how you'd like them to appear. The answer is *no* — mixin classes are generated dynamically based on what the components need. If a previously generated class for a mixin is generated before a mixin you want to take higher precedence on a component, a new copy of the mixin class is generated.

## Selectors
Selectors are more restrictive than in base CSS, as chiri stylesheets are intended to be used *exclusively* for components, and *anything* that needs custom styles *should* be a component.

Anatomy of a selector:

class name|state (optional)
-|-
.button-main|:hover

That's it.

Possible values for `state` are as follows:
```
; state selectors that match the component itself:
:hover ; equivalent to CSS :hover:not(:has(:hover))
:active ; equivalent to CSS :active:not(:has(:active))
:focus ; equivalent to CSS :focus-visible
:focus-any ; equivalent to CSS :focus

; state selectors that also match descendants:
::hover ; equivalent to CSS :hover
::active ; equivalent to CSS :active
::focus ; equivalent to CSS :has(:focus-visible)
::focus-any ; equivalent to CSS :focus-within
```

## Pseudo-elements
Pseudo-elements are possible, but they cannot be part of a selector.

```chiri
%arrow-right:
	@before:
		border: 5px solid transparent
		border-left-colour: currentcolour
```

