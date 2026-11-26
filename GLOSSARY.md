# Distro Picker

A guided recommendation and exploration tool that matches people to Linux distributions using a shared ten-dimension model and qualitative fit labels.

## Language

**Quiz Run**:
A user's in-progress or completed pass through an audience-specific quiz flow (**Newcomer** or **Experienced**), holding their chosen answers and current step.
_Avoid_: Quiz session, quiz state, run store

**Preference Profile**:
The normalized set of weighted **Dimension** ideals derived from a **Quiz Run**, excluding neutral ("not sure") answers.
_Avoid_: User profile, answer vector, weights map

**Recommendation Result**:
The ranked output produced from a **Preference Profile** across the curated **Distro** dataset, consisting of one top pick, two alternatives, and qualitative fit labels with reasons and tradeoffs.
_Avoid_: Match score, ranking response, result payload

**Distro**:
A curated Linux distribution profile evaluated across the ten **Dimensions**, carrying ratings, living-with expectations, official links, review date, and an optional **Caveat**.
_Avoid_: Distro record, distro object, card model

**Caveat**:
An explicit editorial caution attached to a **Distro** describing operational demands or sharp edges (required whenever `ease-of-use` rates 2 or below), scoped by target audience (`newcomers` or `everyone`).
_Avoid_: Warning banner, disclaimer, alert, fallback caution
