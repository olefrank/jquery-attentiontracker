; // defensive programming: script may be concatenated with others

/*
 * AttentionTracker | v0.2
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

(function( $ ) {

    "use strict";

    $.fn.attentionTracker = function(options) {
        var self = this;

        // default settings
        var settings = $.extend({

            pctInView: 50
            , scrollByThresholdMs: 1000
            , scrollThrottleMs: 150
            , scrolldepthEventPrefix: "le_sd"
            , totaltimeEventPrefix: "le_tt"
            // , scrolldepthInterval: .2
            , trackTotalTime: true // todo: omdøb til "heartbeat..."
            , heartbeatIntervalMs: 2000
            , stop_heartbeat_after_ms: 18000
            , eventCallback: function(message) { sendEvent(message); }
            , logCallback: function(message) { logEvent(message); }

        }, options);

        // total values to add up for all elements
        var totalTime = 0,
            scrollDepthPct = -1;

        return this.each(function() {

        ////////////////////
        // Window On Load //
        ////////////////////
        window.onload = function() {

            // if content in view on load
            calcViewPosition();
            if ( isElementVisible() ) {
                if (!isTimerRunning) {
                    startTimer();
                }
            }

            calcScrollDepth();
        }

        //////////////////////
        // Window On Scroll //
        //////////////////////
        window.onscroll = function() {

            clearTimeout(scrollDelay);
            scrollDelay = setTimeout(function() {

                calcViewPosition();
                calcScrollDepth();

                // only if event on before unload
                if (settings.trackTotalTime) {

                    if ( isElementVisible() ) {

                        if (!isHeartbeat) {
                            heartbeat();
                            isHeartbeat = true;
                        }

                        if (!isTimerRunning) {
                            startTimer();
                        }
                    }
                    else {
                        if (isTimerRunning) {
                            stopTimer();
                        }

                        if (isHeartbeat) {
                            clearInterval(heartbeatTimer);
                            isHeartbeat = false;
                        }
                    }
                }
            }, settings.scrollThrottleMs);

        }

        /////////////////////////////
        // Window On Before Unload //
        /////////////////////////////
        window.onbeforeunload = function(e) {
            // stop timers
            if (isTimerRunning) {
                stopTimer();
            }

            clearTimeout(scrollDelay);
            //clearTimeout(totalTimeEvent);
            clearInterval(heartbeatTimer);

            // send event
            if (settings.trackTotalTime) {
                var message = "total time in view: " + totalTime;
                settings.eventCallback(message);
            }
        }

            ///////////////
            // Variables //
            ///////////////
            var element = $(this),
                elementTop = element.offset().top, 
                elementBottom = elementTop + element.outerHeight(true),
                elementMiddle = elementBottom - ((elementBottom - elementTop) / 2),
                elementHeight = element.height(),
                viewTop, viewBottom, viewHeight,
                dateStart, dateEnd,
                timeSpent = 0,
                isTimerRunning = false,
                scrollDelay,
                scrollStart, scrollEnd, timeDiff,
                eventString = "",
                isHeartbeat = false,
                heartbeatTimer,
                heartbeatCounter = 0,
                viewed0 = false,
                viewed20 = false,
                viewed40 = false,
                viewed60 = false,
                viewed80 = false,
                viewed100 = false;

            function heartbeat() {
                var now,
                    timeSpent,
                    totalTimeTemp = 0,
                    message;


                // first heart beat
                if (heartbeatCounter === 0) {
                    message = settings.totaltimeEventPrefix + "_" + heartbeatCounter + "=" + totalTimeTemp;
                    settings.eventCallback(message);
                }

                heartbeatTimer = setInterval(function() {
                    heartbeatCounter++;
                    now = new Date();
                    timeSpent = now.getTime() - dateStart.getTime();

                    if (timeSpent > settings.scrollByThresholdMs) {
                        totalTimeTemp = totalTime + timeSpent;
                        message = settings.totaltimeEventPrefix + "_" + heartbeatCounter + "=" + totalTimeTemp;
                        settings.eventCallback(message);
                    }
                }, settings.heartbeatIntervalMs);
            }

            // Calculates view y coordinates (top/bottom)
            // Sets variables viewTop, viewBottom, viewHeight
            function calcViewPosition() {
                // set top/bottom for visible part of page
                viewTop = $(window).scrollTop();
                viewBottom = viewTop + $(window).height();
                viewHeight = viewBottom - viewTop;
            }

           function calcScrollDepth() {
               if (viewBottom >= elementTop && scrollDepthPct < 1) {

                   // Scroll depth on page
                   var scrollDepthPctCalc =  (viewBottom - elementTop) / elementHeight;

                   // only increment
                   if (scrollDepthPctCalc > scrollDepthPct) {

                       // limit to 100%
                       scrollDepthPct = scrollDepthPctCalc > 1 ? 1 : scrollDepthPctCalc;

                       scrollEnd = new Date();
                       if (typeof scrollStart === "undefined")
                           scrollStart = new Date();

                       // calc time difference
                       timeDiff = ( scrollEnd.getTime() - scrollStart.getTime() );

                       // if 0 - 19 %
                       if (!viewed0 && scrollDepthPct >= 0) {
                           scrollStart = new Date();

                           eventString += settings.scrolldepthEventPrefix + "_0=" + timeDiff;
                           viewed0 = true;
                       }
                       // if 20 - 39 %
                       if (!viewed20 && scrollDepthPct >= 0.2) {
                           if (eventString.length > 0)
                               eventString += "&";

                           eventString += settings.scrolldepthEventPrefix + "_20=" + timeDiff;
                           viewed20 = true;
                       }
                       // if 40 - 59 %
                       if (!viewed40 && scrollDepthPct >= 0.4) {
                           if (eventString.length > 0)
                               eventString += "&";

                           eventString += settings.scrolldepthEventPrefix + "_40=" + timeDiff;
                           viewed40 = true;
                       }
                       // if 60 - 79 %
                       if (!viewed60 && scrollDepthPct >= 0.6) {
                           if (eventString.length > 0)
                               eventString += "&";

                           eventString += settings.scrolldepthEventPrefix + "_60=" + timeDiff;
                           viewed60 = true;
                       }
                       // if 80 - 99 %
                       if (!viewed80 && scrollDepthPct >= 0.8) {
                           if (eventString.length > 0)
                               eventString += "&";

                           eventString += settings.scrolldepthEventPrefix + "_80=" + timeDiff;
                           viewed80 = true;
                       }
                       // if 100 %
                       if (!viewed100 && scrollDepthPct >= 1) {
                           if (eventString.length > 0)
                               eventString += "&";

                           eventString += settings.scrolldepthEventPrefix + "_100=" + timeDiff;
                           viewed100 = true;
                       }

                       // send event
                       if (eventString.length > 0) {
                           settings.eventCallback(eventString);
                           eventString = "";
                       }
                   }
               }
           }

            // Determines if element fills percentage of view
            // ex. if settings.pctInView = 50 -> calcutales if element fills 50% of view
            function isElementVisible() {
                var elementPxInView,
                    pctViewHeight = viewHeight * (settings.pctInView / 100);

                if (viewTop <= elementMiddle) {
                    elementPxInView = viewBottom - elementTop;
                }
                else {
                    elementPxInView = elementBottom - viewTop;
                }

                return elementPxInView >= pctViewHeight;
            }

            // Sets dateStart (= timer start)
            function startTimer() {
                dateStart = new Date();
                isTimerRunning = true;
            }

            // Sets dateEnd (= timer stop)
            // Calculates difference in ms between dateStart and dateEnd
            // Checks for "scroll by"
            function stopTimer() {
                dateEnd = new Date();
                isTimerRunning = false;

                timeSpent = dateEnd.getTime() - dateStart.getTime();

                // add to total if longer than scrollBy threshold
                if (timeSpent > settings.scrollByThresholdMs) {
                    totalTime += timeSpent;
                }
            }

        }); // end return

        // Send events
        function sendEvent(message) {
            console.log("simulate event send: " + message);
        }

        function logEvent(message) {
            console.log("simulate log message: " + message)
        }

    }; // end plugin

} (jQuery) );
