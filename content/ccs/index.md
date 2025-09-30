---
title: "ClickCrystals Script"
summary: "A Scripting Language for making scripts within ClickCrystals"
created: "2025-09-30"
updated: "2025-09-30"
isdoc: false
---

ClickCrystalsScript (or CCS) is a scripting language developed by [ImproperIssues](https://github.com/ItziSpyder) for [ClickCrystals](https://clickcrystals.xyz). It allows users to make custom macros/auto-swaps using its simple syntax. It later inspired and led to the development of [Tums](/tums).

!((warning This is not documentation!)[This is NOT the official documentation for CCS. Refer the documentation on the website instead])

## Syntax

```javascript
def module Critical-Trigger-Bot
def desc "An extremely powerful triggerbot that will always crit the opponent when falling"

// CCS script written by Jat9119

on pre_tick {
   if playing {
      if target_entity :player,:armor_stand {
         !if blocking {
            !if input_active use {
            if attack_progress >=0.9 {
               !if blocking {
                  if holding #sword {
                    if on_ground {
                        input attack
                    }
                    !if on_ground {
                        if falling {
                            input attack
                           }
                        }
                    }
                  }
               }
            }
         }
      }
   }
}
```

CCS is a scripting language designed to be both beginner-friendly and powerful. It supports optional use of brackets and semicolon within code. CCS also introduces a unique then chain syntax, which allows multiple statements to be linked together seamlessly with `then`. Users can also respond to client-side events through built-in event hooks written in an on block. The language includes familiar constructs such as if statements, logical operations, aswell as Minecraft utilities.

Unlike many other scripting languages, CCS does not include variables. It supports only two core types—strings and numbers (integers/doubles) keeping the language very simple while still being effective for macro development.

