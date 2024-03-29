// create calendar object through self-invoked function
var calendar = (function(){
	"use strict";
	// fetch calendar events from the global variable defined in events.js
	var events = CALENDAR_EVENTS;
	// get current date
	var today = new Date();
	// params to hold date components, by default today's date, if no other date is supplied
	var params = {
		day: today.getDay(),
		date: today.getDate(),
		month: today.getMonth(),
		year: today.getFullYear(),
		eventDates: [],
		eventDescriptions: [],
	};
	// common utilities
	var utility = {
		getMonthName: function(monthNumber) {
			switch(monthNumber) {
				case 0: return "January";
				case 1: return "February";
				case 2: return "March";
				case 3: return "April";
				case 4: return "May";
				case 5: return "June";
				case 6: return "July";
				case 7: return "August";
				case 8: return "September";
				case 9: return "October";
				case 10: return "November";
				case 11: return "December";
				default: return "Invalid number";
			}
		},
		getDayName: function(dayNumber) {
			switch(dayNumber) {
				case 0: return "Sunday";
				case 1: return "Monday";
				case 2: return "Tuesday";
				case 3: return "Wednesday";
				case 4: return "Thursday";
				case 5: return "Friday";
				case 6: return "Saturday";
				default: return "Invalid number";
			}
		},
		setStyle: function(element, styles) {
			for(var style in styles) {
				element.style[style] = styles[style];
			}
		},
		setText: function(element, text) {
			element.textContent = text;
		},
		startsFromDay: function(date) {
			return date.getDay();
		},
		isLeap: function(yearNumber) {
			if(yearNumber%400 === 0) {
				return true;
			} 
			else if(yearNumber%100 === 0) {
				return false;
			} 
			else if(yearNumber%4 === 0) {
				return true;
			} 
			else {
				return false;
			}
		},
		getNumberOfDays: function(monthNumber) {
			switch(monthNumber) {
				case 0: return 31;
				case 1: return this.isLeap(params.year) ? 29 : 28;
				case 2: return 31;
				case 3: return 30;
				case 4: return 31;
				case 5: return 30;
				case 6: return 31;
				case 7: return 31;
				case 8: return 30;
				case 9: return 31;
				case 10: return 30;
				case 11: return 31;
				default: return "Invalid number";
			}
		},
		fillBack: function(prevMonth, daysToBeFilled) {
			if(prevMonth === -1) {
				prevMonth = 11;
			}
			var returnArr = [];
			var start = this.getNumberOfDays(prevMonth);
			var end = start - (daysToBeFilled - 1);
			for(var i=end; i<=start; i++) {
				returnArr.push(i);
			}
			return returnArr;
		},
		fillAhead: function(daysToBeFilled) {
			var returnArr = [];
			var end = 1 + (daysToBeFilled - 1);
			for(var i=1; i<=end; i++) {
				returnArr.push(i);
			}
			return returnArr;
		},
		getDatesToBeFilled: function() {
			var date = new Date(params.year, params.month, params.date);
			var startsFromDay = this.startsFromDay(new Date(date.getFullYear(), date.getMonth(), 1));
			var numberOfDays = this.getNumberOfDays(date.getMonth());
			var returnArr = [];
			var fillBack = [];
			var fillAhead = [];
			var curMonthDatesStartFrom = 0;
			var curMonthDatesEndAt = numberOfDays - 1;
			if(startsFromDay > 0) {
				fillBack = this.fillBack(date.getMonth() - 1, startsFromDay);
				returnArr = returnArr.concat(fillBack);
				curMonthDatesStartFrom = returnArr.length;
			}
			for(var i=1; i<=numberOfDays; i++) {
				returnArr.push(i);
			}
			curMonthDatesEndAt = returnArr.length - 1;
			if(returnArr.length != 42) {
				fillAhead = this.fillAhead(42 - (fillBack.length+numberOfDays));
				returnArr = returnArr.concat(fillAhead);
			}
			returnArr.push(curMonthDatesStartFrom, curMonthDatesEndAt);
			return returnArr; 
		},
		setEvents: function() {
			// fetch recurring (annual) events first
			var i = 0;
			var genericYear = 'Y0000';
			var eventArray;
			while(events[genericYear][i]) {
				if(events[genericYear][i][1] == params.month) {
					// fetch corresponding event descriptions and temporarily hold them in an array
					eventArray = events[genericYear][i].slice(2);
					// push date into the params eventDates array only if it has not been already added
					if(!params.eventDates.includes(events[genericYear][i][0])) {
						params.eventDates.push(events[genericYear][i][0]);
						params.eventDescriptions.push(eventArray);
					}
					// otherwise don't push date, and push events into an already existing corresponding array in eventDescriptions array 
					else {
						params.eventDescriptions[params.eventDates.indexOf(events[genericYear][i][0])] = params.eventDescriptions[params.eventDates.indexOf(events[genericYear][i][0])].concat(eventArray);
					}
				}
				i++;
			}
			i = 0;
			// then fetch specific year events
			if(events['Y'+params.year]) {
				// fetch events only for the month/year currently in view
				while(events['Y'+params.year][i]) {
					if(events['Y'+params.year][i][1] == params.month) {
						// fetch corresponding event descriptions and temporarily hold them in an array
						eventArray = events['Y'+params.year][i].slice(2);
						// push date into the params eventDates array only if it has not been already added
						if(!params.eventDates.includes(events['Y'+params.year][i][0])) {
							params.eventDates.push(events['Y'+params.year][i][0]);
							params.eventDescriptions.push(eventArray);
						}
						// otherwise don't push date, and push events into an already existing corresponding array in eventDescriptions array 
						else {
							params.eventDescriptions[params.eventDates.indexOf(events['Y'+params.year][i][0])] = params.eventDescriptions[params.eventDates.indexOf(events['Y'+params.year][i][0])].concat(eventArray);
						}
					}
					i++;
				}
			}
		},
	};
	// dom manipulation methods
	var dom = {
		create: function() {
			// create UI elements
			var d = document.createDocumentFragment();
			var header = document.createElement('div');
			var monthHeading = document.createElement('h1');
			var btnBack = document.createElement('button');
			var btnNext = document.createElement('button');
			var arrowBack = document.createElement('span');
			var arrowNext = document.createElement('span');
			var daysHeader = document.createElement('div');
			var datesHolder = document.createElement('div');
			var style = document.createElement('style');
			var eventDrawer = document.createElement('div');
			var eventDrawerHeading = document.createElement('h2');
			// inject some animation into style tag
			utility.setText(style, "@keyframes dateRipple{to{transform: translate(-50%, -50%) scale(3);opacity: 0;}}");
			// append style tag to head of the document
			document.head.appendChild(style);
			// add fa classes for icons
			arrowBack.setAttribute("class", "fa fa-angle-left");
			arrowNext.setAttribute("class", "fa fa-angle-right");
			// style the buttons
			utility.setStyle(btnNext, {float: "right", color: "#fff", background: "transparent", padding: "0 5px", border: "0", fontSize: "1.4em", cursor: "pointer"});
			utility.setStyle(btnBack, {float: "left", color: "#fff", background: "transparent", padding: "0 5px", border: "0", fontSize: "1.4em", cursor: "pointer"});
			// insert fa arrows into the buttons
			btnBack.appendChild(arrowBack);
			btnNext.appendChild(arrowNext);
			// add event listeners to buttons
			btnBack.onclick = calendar.prevMonth;
			btnNext.onclick = calendar.nextMonth;
			// set header
			utility.setStyle(header, {padding: "16px", background: "#1b363f", textAlign: "center"});
			// set monthHeading
			utility.setStyle(monthHeading, {color: "#fff", display: "inline-block", margin: "auto", fontSize: "1.4em"});
			utility.setText(monthHeading, utility.getMonthName(params.month)+", "+params.year);
			// assign id to heading for later manipulation
			monthHeading.setAttribute("id", "monthHeading");
			// append month and date heading
			header.appendChild(monthHeading);
			// append the buttons to the header
			header.appendChild(btnNext);
			header.appendChild(btnBack);
			// append to fragment
			d.appendChild(header);
			utility.setStyle(daysHeader, {overflow: "auto", padding: "12px", background: "#e95b5a", color: "#fff"});
			// create days chips
			for(var i=0; i<7; i++) {
				var dayChip = document.createElement('div');
				utility.setStyle(dayChip, {float: "left", width: "14.285714285714%", textAlign: "center"});
				utility.setText(dayChip, utility.getDayName(i).slice(0,3));
				daysHeader.appendChild(dayChip); 
			}
			utility.setStyle(datesHolder, {display: "flex", flexWrap: "wrap", background: "#fff", color: "#000", alignItems: "center", boxShadow: "1px 1px 4px grey", padding: "4px 12px", minHeight: "calc(100% - 104px)", position: "relative", overflow: "hidden"});
			// assign a unique id to datesHolder for later manipulation
			datesHolder.setAttribute("id", "datesHolder");
			// fetch dates and append to datesHolder
			datesHolder.appendChild(this.createDates());
			// append to fragment
			d.appendChild(daysHeader);
			// append to fragment
			d.appendChild(datesHolder);
			// style event drawer
			utility.setStyle(eventDrawer, {position: "absolute", bottom: "0", left: "2%", width: "96%", background: "#fff", boxShadow: "0 0 4px grey", minHeight: "160px", borderRadius: "10px 10px 0 0", transform: "translateY(100%)", transition: "all 0.5s", maxHeight: "70%", overflowY: "auto"});
			// attach an id to the eventDrawer for later manipulation
			eventDrawer.setAttribute("id", "eventDrawer");
			// style event drawer heading
			utility.setStyle(eventDrawerHeading, {display: "block", margin: "0", fontSize: "1.2em", textAlign: "center", color: "#fff", padding: "12px 0", borderRadius: "10px 10px 0px 0px", background: "#1b363f"});
			// attach click event listener to header, daysheader and datesholder with capturing so that clicking anywhere outside the event drawer pushes it off screen
			header.onclick = calendar.hideEvents;
			datesHolder.onclick = calendar.hideEvents;
			daysHeader.onclick = calendar.hideEvents;
			// append to event drawer
			eventDrawer.appendChild(eventDrawerHeading);
			// append to fragment
			d.appendChild(eventDrawer);
			// finally append fragment to calendar
			document.getElementById("calendar").appendChild(d);
			// set font size for the calendar
			document.getElementById("calendar").style.fontSize = "16px";
			// set overflow to hidden for the calendar
			document.getElementById("calendar").style.overflow = "hidden";
		},
		createDates: function() {
			var dates = utility.getDatesToBeFilled();
			var fragment = document.createDocumentFragment();
			// highlight today's date or first of any other month
			var highlightedDate;
			if(today.getFullYear() == params.year && today.getMonth() == params.month) {
				highlightedDate = today.getDate();
			} else {
				highlightedDate = 1;
			}
			// fetch events for the month in view
			utility.setEvents();
			for(var k=0, startIndex=dates[dates.length-2], endIndex=dates[dates.length-1]; k<42; k++) {
				var dateNumber = document.createElement('div');
				utility.setStyle(dateNumber, {flex: "0 1 14.285714285714%", textAlign: "center", padding: "12px 0", cursor: "default", fontWeight: "bold", position: "relative", transition: "all 0.4s", overflow: "hidden"});
				utility.setText(dateNumber, dates[k]);
				// if dates are placeholders for prev/next month, dull their color/opacity
				if(!(k>=startIndex && k<=endIndex)) {
					utility.setStyle(dateNumber, {opacity: "0.25"});
				}
				// create hoverable borders around focusable dates of current month
				else {
					utility.setStyle(dateNumber, {border: "2px solid transparent", borderRadius: "350px"});
					// set mouseenter, mouseleave event listeners on all focusable dates
					dateNumber.onmouseenter = calendar.hover;
					dateNumber.onmouseleave = calendar.hoverOut;
					// add onclick event on all focusable dates to pull event drawer
					dateNumber.onclick = calendar.showEvents;
					// highlight currently set date
					if(dates[k] == highlightedDate) {
						utility.setStyle(dateNumber, {border: "2px solid #e95b5a", borderRadius: "350px"});
						// data attribute marker for unique identification
						dateNumber.setAttribute("data-i", "current");
					}
					// if an event falls on this date of the current month, show a small dot at bottom
					if(params.eventDates.includes(dates[k])) {
						var dotMark = document.createElement('div');
						utility.setStyle(dotMark, {position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", background: "#e95b5a", borderRadius: "200px"});
						// also add data-events attribute containing references to the eventDescriptions array
						dateNumber.setAttribute("data-evt", params.eventDates.indexOf(dates[k]));
						dateNumber.appendChild(dotMark);
					}
				}
				// change colors for dates falling on Sundays
				if(k%7 === 0) {
					utility.setStyle(dateNumber, {color: "#e95b5a"});
				}
				fragment.appendChild(dateNumber);
			}
			return fragment;
		},
		changeMonth: function() {
			var datesHolder = document.getElementById('datesHolder');
			// change month and date heading
			utility.setText(document.getElementById('monthHeading'), utility.getMonthName(params.month)+", "+params.year);
			utility.setText(datesHolder, '');
			// fetch dates and append to datesHolder
			datesHolder.appendChild(this.createDates());
		},
		createAnimationOnHover: function(e) {
			var dateInFocus = e.currentTarget;
			dateInFocus.style.borderColor = "#1b363f";
			// create circular ripple effect
			var circle = document.createElement('span');
			var diameter = Math.max(dateInFocus.clientWidth, dateInFocus.clientHeight);
			utility.setStyle(circle, {width: diameter+"px", height: diameter+"px", position: "absolute", left: "50%", top: "50%", borderRadius: "50%", transform: "translate(-50%, -50%) scale(0)", background: "rgba(230,230,230,0.6)", animation: "dateRipple 1100ms linear"});
			var existingRipple = dateInFocus.querySelector('span');
			if(existingRipple) {
				existingRipple.remove();
			}
			dateInFocus.appendChild(circle);
		},
		clearAnimationOnHoverOut: function(e) {
			var dateInFocus = e.currentTarget;
			if(!dateInFocus.dataset.i) {
				dateInFocus.style.borderColor = "transparent";
			}
			else {
				dateInFocus.style.borderColor = "#e95b5a";
			}
			// remove ripple element
			dateInFocus.querySelector('span').remove();
		},
		pullEventDrawer: function(e) {
			var eventDrawer = document.getElementById("eventDrawer");
			var events, oldEvts, headingStyles;
			// pull drawer up
			eventDrawer.style.transform = "translateY(0px)";
			// set clicked date as the heading
			utility.setText(eventDrawer.firstElementChild, e.currentTarget.textContent + " " + utility.getMonthName(params.month));
			e.stopPropagation();
			// fetch events associated with the date clicked on
			events = e.currentTarget.dataset.evt;
			// remove old event names first
			oldEvts = document.querySelectorAll("#eventDrawer h3");
			// define styles for event description headings
			headingStyles = {textAlign: "center", color: "rgb(30,30,30)", margin: "10px 4px", fontSize: "1.1em"};
			if(oldEvts) {
				var k = 0;
				while(oldEvts[k]) {
					oldEvts[k].remove();
					k++;
				}
			}
			if(events) {
				var i = 0;
				while(params.eventDescriptions[events][i]) {
					var eventDesc = document.createElement('h3');
					utility.setStyle(eventDesc, headingStyles);
					utility.setText(eventDesc, params.eventDescriptions[events][i]);
					eventDrawer.appendChild(eventDesc);
					i++;
				}
			} else {
				// say no events on this date
				var noEvt = document.createElement('h3');
				utility.setStyle(noEvt, headingStyles);
				utility.setText(noEvt, "No events");
				eventDrawer.appendChild(noEvt);
			}
		},
		pushEventDrawer: function() {
			var eventDrawer = document.getElementById("eventDrawer");
			// push drawer down the screen
				eventDrawer.style.transform = "translateY(100%)";
		},
	};
	return {
		init: function(d,m,y) {
			params.date = d || params.date;
			params.month = m || params.month;
			params.year = y || params.year;
			params.day = new Date(y,m,d).getDay();
			dom.create();
		},
		nextMonth: function() {
			if(params.month === 11) {
				params.month = 0;
				params.year++;
			} 
			else {
				params.month++; 
			}
			params.date = 1;
			params.eventDates = [];
			params.eventDescriptions = [];
			dom.changeMonth();
		},
		prevMonth: function() {
			if(params.month === 0) {
				params.month = 11;
				params.year--;
			} 
			else {
				params.month--; 
			}
			params.date = 1;
			params.eventDates = [];
			params.eventDescriptions = [];
			dom.changeMonth();
		},
		hover: function(e) {
			dom.createAnimationOnHover(e);
		},
		hoverOut: function(e) {
			dom.clearAnimationOnHoverOut(e);
		},
		showEvents: function(e) {
			dom.pullEventDrawer(e);
		},
		hideEvents: function() {
			dom.pushEventDrawer();
		},
	};
})(); // end self-invoked function
calendar.init(); // call calendar.init() to construct calendar