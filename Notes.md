
1. Grayscale color scheme with blue and magenta accents
2. Centralize the theming, type, colors and spacing, in a single general scss
3. Install and use scss
4. Prefer full width interfaces
5. Save scss styling as a separate file, save with the component in their own folder
6. Follow the rules of BEM, with some tweaks: 
- Dont use "&" to select parent components, instead always write the full class name, "&" should only be used to concatenate selectors
- For flags, use "--{flag-name}", instead of writing again the full name of the component. Example "button" -> "button --active"
- Do not anidate more than 3 levels. Example
Selector 1 {
  Selector 2 {
    Selector 3 {
      // Good Practice so far
      Selector 4 { // Bad practice from here
        
      }
    }
  }
}
7. Always have a dark / light theme toggle