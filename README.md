"AttentionTracker" is a jQuery plugin. It can be used to measure user attention on a website.
    - how far down are users scrolling on specific content with time stamps
    - how long has specific content been "in view"

Options: (option  |  default  |  description)
    - pctInView (50): percentage of content in view before counting as page view time
    - scrollByThreshold (0): interval (in ms) for "scroll by". If below, don't add to total page view time
    - scrollThrottleMs (150): delay (in ms) before doing calculations after scroll. Good for performance!
    - scrollDepthEventPrefix (le_sd): prefix event string (example: scrolldepth 40%, 3 secs is "le_sd_40=3")
    - sendOnPageExit (false): send an event when user leaves a page or closes browser. Event contains total time spent "in view"
    - eventCallback: function to handle events (send events)
    - logCallback: function to handle logging

Usage examples: 
    - Track all elements with class 'content-block' when they fill at least 50% of screen
      $('.content-block').trackViewTime();

    - Chaining with jQuery method 'css' to set font color to 'white'
      $('.content-block').trackViewTime({pctInView: 0}).css('color', 'white');
