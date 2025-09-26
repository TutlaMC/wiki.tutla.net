---
title: "Tusan"
summary: "Tusan is a library for making interpreters and simple compilers"
created: "2025-08-10"
updated: "2025-08-10"
isdoc: true
---

Welcome to the Tusan documentation!

---
## What is Tusan?

Tusan is a library made for creating interpreters & compilers (coming soon). Available in both Python, Java and soon Javascript. Used in [Tusk](https://tusk.tutla.net) & [Tums](/tums).

It comes with a custom prebuilt syntax with built in variable definition, function declaration and iterative statements.

!((warning Tusan is still under development!)[Tusan is still under development- this means many features & documentation are incomplete])

## Languages

Tusan is currently written in 2 languages- Python, Java and is soon planned to be ported to Javascript aswell. For Tusan to be ported to any other language it would require:
- Objects
- Garbage Collector (you could write your own)
- Universal supertype (similar to `Object` in Java & `any` in Typescript)

## Syntax Demo

### Base Syntax

```python
# Variable Declaration* (varies across implementations currently*)
let x be 9
print x
```

```lua
# Functions
function addTwoNumbers number1:number number2:number:
    return number1 + number2
end
```

Due to Tusan's quirky syntax, the following would also work:

```javascript
print("Hi World!")

if (2>1) then {
    print("yup")
} else {
    print("nuh uh")
}
```

In some versions you amy also use `;` to end statements

### Implementations

In [Tusk](/tusk):
```lua
on message
    if event_message's content is "hello" then
        reply to event_message with "hi!"
    else
        reply to event_message with "yo"
    end
end
```

In [Tums](/tums)
```lua
on attack
    print event_entity's name
end
```