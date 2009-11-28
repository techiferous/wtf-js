/******************************************************************************
 *  WTF JAVASCRIPT LIBRARY, VERSION 1.0.0
 *
 *-----------------------------------------------------------------------------
 *  Overview
 *-----------------------------------------------------------------------------
 *
 *  The WTF JavaScript Library provides functions to convert between standard
 *  time and World Time Format.  For more information, visit
 *  http://www.worldtimeformat.com
 *
 *-----------------------------------------------------------------------------
 *  License
 *-----------------------------------------------------------------------------
 *
 *  This software uses the MIT License.
 *
 *  (c) 2009 Wyatt Greene
 *
 *  Permission is hereby granted, free of charge, to any person
 *  obtaining a copy of this software and associated documentation
 *  files (the "Software"), to deal in the Software without
 *  restriction, including without limitation the rights to use,
 *  copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following
 *  conditions:
 *  
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *  OTHER DEALINGS IN THE SOFTWARE.
 *
 *--------------------------------------------------------------------------*/



/******************************************************************************
 *  PUBLIC FUNCTIONS
 *-----------------------------------------------------------------------------
 *
 *  The following functions make up the API of the WTF JavaScript Library.
 *
 *---------------------------------------------------------------------------*/



var WTF = {};  // The namespace.



// Description:
//   toWtf is used to convert a date to World Time Format.
//
// Input:
//   toWtf expects a JavaScript Date object
//
// Output:
//   toWtf returns a JavaScript object with the following properties:
//     - datePart: A string that represents the World Time Format day.
//       The string is five characters long and contains only characters
//       between A-Z inclusive.
//     - timePart: A string that represents the World Time Format time.
//       The string is five characters long and contains only characters
//       between A-Z inclusive.
//     - value: A string that contains the datePart joined to the timePart
//       with a colon.
//
// Notes:
//   - The date conversion does not work before the Gregorian calendar change
//     that happened in October 1582.
//   - Since the datePart is limited to five characters, there is an upper
//     bound for how far into the future you can do a date conversion.
//   - The timePart is limited to five characters and therefore the
//     time precision is limited to about 10 milliseconds.
//   - Time conversions may not work properly on the day of a Daylight Saving
//     Time change.  This is probably due to buggy browser JavaScript
//     implementations and does not represent an inherent limitation of this
//     library.
//   - Leap seconds were not taken into account.
//
// Example:
//
//  var date = new Date(2005, 10, 5);
//  var wtf = WTF.toWtf(date);
//  alert(wtf.datePart);
//  alert(wtf.timePart);
//  alert(wtf.value);
//
WTF.toWtf = function(x) {
  return this._dateToWtf(x);
};



// Description:
//   toDate is used to convert a World Time Format time or date into a
//   JavaScript Date object.
//
// Input:
//   toDate expects either
//     - a string representation of a World Time Format time or date
//     - an object that has a property named "value" that is a string
//       representation of a World Time Format time or date
//   The string representation can contain a date part, a time part, and a
//   colon to separate them.  Here are some examples of valid formats:
//     - "FJKRM:BROMQ" -- This is a fully specified World Time Format date and
//       time.  The first part is the date part and the second part is the time
//       part.  The date part cannot be longer than five characters.  The time
//       part can be longer than five characters, but any characters after
//       the fifth character are ignored when calculating.
//     - ":BROMQ" -- You can leave out the date part.  Today is assumed.
//     - "FJKRM:" -- You can leave out the time part.  The beginning of the
//       Julian day is assumed (which is noon).
//     - "BROMQ" -- If you leave out the colon, it is assumed that you are
//       giving the time, not the date.
//     - "RM:BROMQ" -- You can leave out some of the digits for the date.  If
//       you do, the remaining digits will be filled in according to today's
//       date.  If today's date is FMBAZ, then "RM:BROMQ" becomes
//       "FMBRM:BROMQ".
//     - ":BR" -- You don't have to specify all five of the time digits.
//     - "A:B" -- This is a valid format.
//
// Output:
//   toDate returns a JavaScript Date object.
//
// Notes:
//   Refer to the notes section in the WTF.toWtf() function comments.
//
// Examples:
//
//   var date = WTF.toDate("FIWIT:NAAAA");  // date and time
//   alert(date);
//
//   var date = WTF.toDate("FIWIT:NA");     // date with less precise time
//   alert(date);
//
//   var date = WTF.toDate("IWIT:NA");      // less precise date as well
//   alert(date);
//
//   var date = WTF.toDate("FIWIT:");       // just the date
//   alert(date);
//
//   var date = WTF.toDate(":NAAAA");       // just the time, today is assumed
//   alert(date);
//
//   var date = WTF.toDate(":N");           // same time, less precise
//   alert(date);
//
//   var date = WTF.toDate("N");            // time is assumed if no colon
//   alert(date);
//
//   var date = WTF.toDate("NAA");          // also the same time
//   alert(date);
//
WTF.toDate = function(x) {
  return WTF._wtfToDate(x);
};



// Description:
//   now is used to get the current time and date in World Time Format.
//
// Output:
//   This function returns the same data structure that the WTF.toWtf()
//   function returns.
//
// Example:
//
//  alert(WTF.now().value);
//
WTF.now = function() {
  return WTF._dateToWtf(new Date());
};



/******************************************************************************
 *  PRIVATE FUNCTIONS
 *-----------------------------------------------------------------------------
 *
 *  The following code is used internally by the WTF JavaScript Library.  To
 *  make testing easier, these functions remain accessible.  These functions
 *  are not meant to be used directly by users of the WTF JavaScript Library,
 *  as the behavior is subject to change in future releases.
 *
 *---------------------------------------------------------------------------*/



// JavaScript's Date methods use the start of the Unix epoch (Jan 1, 1970)
// as a reference point, so to translate between the Julian Date system
// and Date objects, it's useful to know the Julian Date of the start of
// the Unix epoch.
//
WTF._JULIAN_DATE_OF_UNIX_EPOCH_START = 2440587.5;



WTF._MILLIS_IN_A_DAY = 24 * 60 * 60 * 1000;  // millis means milliseconds



// Given a JavaScript Date object, return the Julian Date as a number.
// There is a useful Julian Date converter here:
// http://aa.usno.navy.mil/data/docs/JulianDate.php
//
WTF._dateToJulianDate = function(date) {

  // According to the JavaScript documentation, getTime() is supposed to
  // return the milliseconds according to local time, but it's actually
  // returning the UTC time.  This algorithm is programmed against the
  // actual behavior, not the documented behavior.

  var millisecondsSince1970 = date.getTime();
  return millisecondsSince1970 / WTF._MILLIS_IN_A_DAY +
         WTF._JULIAN_DATE_OF_UNIX_EPOCH_START;

};



// Given a number in base 10, return a number in alphabase.  Note that
// alphabase is different than base 26.  Base 26 uses digits within the range
// 0-9,a-p.  Alphabase is also based on a radix of 26, but uses digits within
// the range A-Z.
//
// To simplify the algorithm, this function does not accept real numbers as
// input, only integers.
//
WTF._decimalToAlphabase = function(decimal) {

  if (Math.floor(decimal) !== decimal) {
    throw { message: "Real numbers not supported." };
  }

 	var alphabase = [];
  var base26 = (new Number(decimal)).toString(26);

 	for (var i=0; i<base26.length; i++) {
 		c = base26.charCodeAt(i);
 		if (c === 45) {  // hyphen for negative numbers
 		  alphabase.push("-");
 		}
    else if ((c >= 97) && (c <= 112)) {  // lower case a-p -> K-Z
      alphabase.push(String.fromCharCode(c - 22));
    }
    else if ((c >= 48) && (c <= 57)) {  // number 0-9 -> A-J
      alphabase.push(String.fromCharCode(c + 17));
    }
    else {
      throw { message: "Unexpected character." };
 		}
 	}

 	// We use an array instead of string concatenation for the sake of speed.
 	return alphabase.join('');

};



// Given an integer representing the number of milliseconds into the Julian
// day, return a five-character string representing the time in World Time
// Format.
//
WTF._timeToWtf = function(millisIntoTheDay) {

  if (millisIntoTheDay < 0) {
    throw { message: "Negative values are not supported." };
  }
  if (millisIntoTheDay >= WTF._MILLIS_IN_A_DAY) {
    throw { message:
     "Value must be smaller than the number of milliseconds in a day." };
  }

  var result = [];
  // For the first loop iteration, the unit represents the number of
  // milliseconds in an entire day.  Then it represents the number of
  // milliseconds in an alphabetic hour, then in an alphabetic minute, all
  // the way down to the number of milliseconds in an alphabetic subsubsecond.
  var unit = WTF._MILLIS_IN_A_DAY;
  var numUnits;
  var remainder = millisIntoTheDay;  // milliseconds left to process
  for (var i=1; i<6; i++) {
    unit = unit / 26;
    numUnits = Math.floor(remainder / unit);
    remainder = remainder - (numUnits * unit);
    result.push(String.fromCharCode(numUnits+65));
  }

 	// We use an array instead of string concatenation for the sake of speed.
 	return result.join('');

};



// Given a JavaScript Date object, return an object representing the WTF time
// and date.
//
WTF._dateToWtf = function(date) {

  var julianDate = this._dateToJulianDate(date);
  var datePart = this._decimalToAlphabase(Math.floor(julianDate));
  var fraction = julianDate - Math.floor(julianDate);
  var fractionInMilliseconds = Math.round(fraction * WTF._MILLIS_IN_A_DAY);
  var timePart = this._timeToWtf(fractionInMilliseconds);

  return { datePart: datePart,
           timePart: timePart,
           value:    datePart + ':' + timePart };

};



// Given a WTF date, return a JavaScript Date object.  The input can either be
// a string (such as "FHJQR:ABRFF") or a JavaScript object that has a property
// named value that produces such a string.
//
WTF._wtfToDate = function(wtf) {

  var wtfString;
  if (wtf && typeof wtf === 'string') {
    wtfString = wtf;
  }
  else if (wtf && typeof wtf === 'object') {
    wtfString = wtf.value;
  }
  else {
    throw { message: "Unsupported type." };
  }
  
  // If no colon is given, we assume we have a time, not a date.
  if (wtfString.indexOf(":") === -1) {
    wtfString = ":" + wtfString;
  }

  var format = /^[A-Z]{0,5}:[A-Z]*$/;
  if (format.test(wtfString) === false) {
    throw { message: "Time format error: " + wtfString };
  }

  wtfString = wtfString.split(":");
  var wtfDate = wtfString[0];
  var wtfTime = wtfString[1];

  if (wtfDate.length < 5) {
    var referenceDate = WTF.now().datePart;
    wtfDate = referenceDate.substring(0, 5 - wtfDate.length) + wtfDate;
  }

  if (wtfTime.length > 5) {
    wtfTime = wtfTime.substring(0, 5)
  }

  var julianDate = 0;
  // compute integer part of Julian Date
  for (var i=0; i<5; i++) {
    julianDate += (wtfDate.charCodeAt(i)-65) * Math.pow(26,4-i);
  }
  // compute fractional part of Julian Date
  for (i=0; i<wtfTime.length; i++) {
    julianDate += ((wtfTime.charCodeAt(i)-65) / Math.pow(26,i+1));
  }

  var d = new Date();
  // I'm assuming that setTime is with respect to UTC, not local time.
  d.setTime(
    (julianDate - WTF._JULIAN_DATE_OF_UNIX_EPOCH_START) *
    WTF._MILLIS_IN_A_DAY
  );
  return d;

};
