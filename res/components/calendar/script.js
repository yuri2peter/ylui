YL.onReady(function () {
  var lang = YL.static.lang === 'zh-cn' ||  YL.static.lang === 'zh-tw'?
    {
      Mon: '星期一',
      MonShort: '一',
      Tues: '星期二',
      TuesShort: '二',
      Wed: '星期三',
      WedShort: '三',
      Thur: '星期四',
      ThurShort: '四',
      Fri: '星期五',
      FriShort: '五',
      Sat: '星期六',
      SatShort: '六',
      Sun: '星期日',
      SunShort: '日',
      Jan: '1月',
      Feb: '2月',
      Mar: '3月',
      Apr: '4月',
      May: '5月',
      June: '6月',
      July: '7月',
      Aug: '8月',
      Sept: '9月',
      Oct: '10月',
      Nov: '11月',
      Dec: '12月',
    }:
    {
      Mon: 'Monday',
      MonShort: 'Mon',
      Tues: 'Tuesday',
      TuesShort: 'Tues',
      Wed: 'Wednesday',
      WedShort: 'Wed',
      Thur: 'Thursday',
      ThurShort: 'Thur',
      Fri: 'Friday',
      FriShort: 'Fri',
      Sat: 'Saturday',
      SatShort: 'Sat',
      Sun: 'Sunday',
      SunShort: 'Sun',
      Jan: 'Jan',
      Feb: 'Feb',
      Mar: 'Mar',
      Apr: 'Apr',
      May: 'May',
      June: 'June',
      July: 'July',
      Aug: 'Aug',
      Sept: 'Sept',
      Oct: 'Oct',
      Nov: 'Nov',
      Dec: 'Dec',
    };
  
  var o_box_time = document.getElementById('_box_time');
  var aDiv_time = o_box_time.getElementsByClassName('div-time');
  var arrWeek = [lang.Sun, lang.Mon, lang.Tues, lang.Wed, lang.Thur, lang.Fri, lang.Sat];
  var oCalendar = o_box_time.getElementsByClassName('calendar')[0];
  var _aStrong = oCalendar.getElementsByTagName('strong');
  var oDays = oCalendar.getElementsByClassName('_days')[0].getElementsByTagName('ul')[0];
  var _oHeader = document.getElementsByClassName('_header')[0];
  var _r_l = _oHeader.getElementsByTagName('span');
  var _oYears_months = o_box_time.getElementsByClassName('_years_months')[0];
  var _oYears_months_ul = _oYears_months.getElementsByTagName('ul')[0];
  var _oNormal = o_box_time.getElementsByClassName('_normal')[0];
  var _aLi_months = _oYears_months.getElementsByTagName('li');
  var _delay_time = null;
  var onOff = 0;
  var _oTenYears = o_box_time.getElementsByClassName('_tenyears')[0];
  var _oTenYears_ul = _oTenYears.firstElementChild;
  var _oTenYears_lis = _oTenYears.getElementsByTagName('li');
  var _nowDate = new Date();
  var _setyear = _nowDate.getFullYear();
  var _setmonth = _nowDate.getMonth();
  var _setdate = _nowDate.getDate();
  var _relYear = _setyear;
  var _relMonth = _setmonth;
  var _relDate = _setdate;
  var _temp_ten = 0;
  initDom();
  showTime();
  setInterval(showTime, 1000);
  
  function showTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var week = date.getDay();
    var str;
    str = toZero(h) + ':' + toZero(m) + ':' + toZero(s);
    aDiv_time[0].innerHTML = str;
    str = year + '/' + month + '/' + day + ',' + arrWeek[week];
    aDiv_time[1].innerHTML = str;
  }
  
  aDiv_time[1].onclick = function () {
    clearTimeout(_delay_time);
    _setyear = _relYear;
    _setmonth = _relMonth;
    _setdate = _relDate;
    showDate();
    onOff = 0;
    _oYears_months.style.display = 'none';
    _oNormal.style.display = 'block';
    _oTenYears.style.display = 'none';
    for (var i = 0; i < _aLi_months.length; i++) {
      _aLi_months[i].className = '';
    }
    _aLi_months[_setmonth].className = 'active';
  };
  var i;
  for (i = 0; i < 3; i++) {
    _aLi_months[_setmonth + i * 12].className = 'active';
  }
  for (i = 0; i < _aLi_months.length; i++) {
    (function (n) {
      _aLi_months[n].onclick = function () {
        var i;
        for (i = 0; i < _aLi_months.length; i++) {
          _aLi_months[i].className = '';
        }
        _setmonth = n % 12;
        for (i = 0; i < _aLi_months.length; i++) {
          _aLi_months[i].className = '';
        }
        
        for (i = 0; i < 3; i++) {
          _aLi_months[_setmonth + i * 12].className = 'active';
        }
        console.log(this.offsetLeft, this.offsetTop);
        
        clearTimeout(_delay_time);
        _delay_time = setTimeout(function () {
          _aStrong[0].innerHTML = _setyear + '/' + (_setmonth + 1);
          _oYears_months.style.display = 'none';
          _oNormal.style.display = 'block';
          
          
          _fn_block(_oNormal);
          
          _oTenYears.style.display = 'none';
          // document.title=onOff;
          showDate();
          onOff = 0;
        }, 200);
        
        
      }
    })(i);
  }
  
  function _fn_block(ele) {
    ele.style.transition = '0s';
    ele.style.transform = 'scale(0.5)';
    setTimeout(function () {
      ele.style.transition = '0.3s';
      ele.style.transform = 'scale(1)';
    }, 10);
  }
  
  showDate();
  
  function showDate() {
    var str = '';
    if (_setmonth === 0) {
      str = _fn_layout(_setyear - 1, 11, _setdate) + _fn_layout(_setyear, _setmonth, _setdate) + _fn_layout(_setyear, _setmonth + 1, _setdate);
    } else if (_setmonth === 11) {
      str = _fn_layout(_setyear, _setmonth - 1, _setdate) + _fn_layout(_setyear, _setmonth, _setdate) + _fn_layout(_setyear + 1, 0, _setdate);
    } else {
      str = _fn_layout(_setyear, _setmonth - 1, _setdate) + _fn_layout(_setyear, _setmonth, _setdate) + _fn_layout(_setyear, _setmonth + 1, _setdate);
    }
    oDays.innerHTML = str;
    _aStrong[0].innerHTML = _setyear + '/' + (_setmonth + 1);
  }
  
  function _fn_layout(_setyear, _setmonth, _setdate) {
    if (_setyear === _relYear && _setmonth === _relMonth) {
      _setdate = _relDate;
    } else {
      _setdate = 1;
    }
    var _oDate = new Date();
    var _date;
    _oDate.setDate(_setdate);
    _oDate.setMonth(_setmonth);
    _oDate.setFullYear(_setyear);
    _date = new Date(_oDate);
    _date.setDate(0);
    var _prevDays = _date.getDate();
    _date = new Date(_oDate);
    _date.setDate(1);
    var _week = _date.getDay();
    _date = new Date(_oDate);
    _date.setDate(1);
    _date.setMonth(_setmonth + 1);
    _date.setDate(0);
    var _allDays = _date.getDate();
    var str = '';
    var num = 0;
    var i;
    if (_week === 0) {
      _week = 7;
    }
    for (i = 0; i < _week; i++) {
      str = '<li class="grey">' + (_prevDays - i) + '</li>' + str;
      num++;
    }
    for (i = 0; i < _allDays; i++) {
      if (i === _setdate - 1) {
        str += '<li class="active">' + (i + 1) + '</li>';
      } else {
        str += '<li>' + (i + 1) + '</li>';
      }
      num++;
    }
    for (i = 0; i < 42 - num; i++) {
      str += '<li class="grey">' + (i + 1) + '</li>';
    }
    return str;
  }
  
  _aStrong[0].onclick = function () {
    clearTimeout(_delay_time);
    if (onOff === 0) {
      _aStrong[0].innerHTML = _setyear;
      _oYears_months.style.display = 'block';
      _fn_block(_oYears_months);
      _oNormal.style.display = 'none';
      _oTenYears.style.display = 'none';
    } else if (onOff === 1) {
      _temp_ten = 0;
      _aStrong[0].innerHTML = Math.floor(_setyear / 10) * 10 + '-' + (Math.floor(_setyear / 10) * 10 + 9);
      _oYears_months.style.display = 'none';
      _oNormal.style.display = 'none';
      _oTenYears.style.display = 'block';
      _fn_block(_oTenYears);
    } else if (onOff === 2) {
      _aStrong[0].innerHTML = _setyear + '/' + (_setmonth + 1);
      _oYears_months.style.display = 'none';
      _oNormal.style.display = 'block';
      _fn_block(_oNormal);
      _oTenYears.style.display = 'none';
    }
    var i;
    for (i = 0; i < _aLi_months.length; i++) {
      _aLi_months[i].className = '';
    }
    for (i = 0; i < 3; i++) {
      _aLi_months[_setmonth + i * 12].className = 'active';
    }
    if (onOff === 1) {
      ten(_setyear);
    }
    if (onOff === 2) {
      showDate();
    }
    onOff++;
    onOff = onOff % 3;
  };
  
  function ten(_year) {
    _oTenYears_ul.innerHTML = _layout_tenyear(_year - 10) + _layout_tenyear(_year) + _layout_tenyear(_year + 10);
    
    for (var i = 0; i < _oTenYears_lis.length; i++) {
      _oTenYears_lis[i].onclick = function () {
        for (var i = 0; i < _oTenYears_lis.length; i++) {
          _oTenYears_lis[i].className === 'active' && (_oTenYears_lis[i].className = '');
        }
        this.className = 'active';
        _setyear = parseInt(this.innerHTML);
        clearTimeout(_delay_time);
        _delay_time = setTimeout(function () {
          onOff = 1;
          _aStrong[0].innerHTML = _setyear;
          _oYears_months.style.display = 'block';
          _fn_block(_oYears_months);
          _oNormal.style.display = 'none';
          _oTenYears.style.display = 'none';
        }, 200);
      }
    }
    
  }
  
  _r_l[0].onclick = function () {
    if (onOff === 0) {
      _setmonth--;
      if (_setmonth === -1) {
        _setmonth = 11;  //0-11
        _setyear--;
      }
      showDate();
      oDays.style.transition = '0s';
      oDays.style.top = '-25.2rem';
      setTimeout(function () {
        oDays.style.transition = '0.5s';
        oDays.style.top = '-12.6rem';
      }, 10);
      
      
    } else if (onOff === 1) {
      _setyear--;
      _oYears_months_ul.style.transition = '0s';
      _oYears_months_ul.style.top = '-21.6rem';
      setTimeout(function () {
        _oYears_months_ul.style.transition = '0.5s';
        _oYears_months_ul.style.top = '-10.8rem';
      }, 10);
      _aStrong[0].innerHTML = _setyear;
    } else if (onOff === 2) {
      _temp_ten--;
      var _temp = _setyear + 10 * _temp_ten;
      _aStrong[0].innerHTML = Math.floor(_temp / 10) * 10 + '-' + (Math.floor(_temp / 10) * 10 + 9);
      ten(_temp);
      
      _oTenYears_ul.style.transition = '0s';
      _oTenYears_ul.style.top = '-21.6rem';
      setTimeout(function () {
        _oTenYears_ul.style.transition = '0.5s';
        _oTenYears_ul.style.top = '-10.8rem';
      }, 10);
    }
  };
  _r_l[1].onclick = function () {
    if (onOff === 0) {
      _setmonth++;
      if (_setmonth === 12) {
        _setmonth = 0;  //0-11
        _setyear++;
      }
      
      showDate();
      oDays.style.transition = '0s';
      oDays.style.top = '0';
      setTimeout(function () {
        oDays.style.transition = '0.5s';
        oDays.style.top = '-12.6rem';
      }, 10);
      
    } else if (onOff === 1) {
      _setyear++;
      _oYears_months_ul.style.transition = '0s';
      _oYears_months_ul.style.top = '0';
      setTimeout(function () {
        _oYears_months_ul.style.transition = '0.5s';
        _oYears_months_ul.style.top = '-10.8rem';
      }, 10);
      _aStrong[0].innerHTML = _setyear;
    } else if (onOff === 2) {
      _temp_ten++;
      var _temp = _setyear + 10 * _temp_ten;
      _aStrong[0].innerHTML = Math.floor(_temp / 10) * 10 + '-' + (Math.floor(_temp / 10) * 10 + 9);
      ten(_temp);
      
      _oTenYears_ul.style.transition = '0s';
      _oTenYears_ul.style.top = '0';
      setTimeout(function () {
        _oTenYears_ul.style.transition = '0.5s';
        _oTenYears_ul.style.top = '-10.8rem';
      }, 10);
      
    }
  };
  
  function toZero(num) {
    return num < 10 ? '0' + num : '' + num;
  }
  
  function _layout_tenyear(_year) {
    var str = '';
    var num = Math.floor(_year / 10) * 10;
    var start = num - 1;
    var end = num + 10;
    for (var i = 0; i < 12; i++) {
      if ((start + i) === _setyear && (start + i) >= num && (start + i) < end) {
        str += '<li class="active">' + (start + i) + '</li>';
      } else if (i === 0 || i === 11) {
        str += '<li class="grey">' + (start + i) + '</li>';
      } else {
        str += '<li>' + (start + i) + '</li>';
      }
    }
    return str;
  }
  
  function initDom() {
    var domWeek = o_box_time.getElementsByClassName('_week')[0];
    var week = [lang.SunShort, lang.MonShort, lang.TuesShort, lang.WedShort, lang.ThurShort, lang.FriShort, lang.SatShort];
    var months = [lang.Jan, lang.Feb, lang.Mar, lang.Apr, lang.May, lang.June, lang.July, lang.Aug, lang.Sept, lang.Oct, lang.Nov, lang.Dec];
    week.forEach(function (t) {
      var span = document.createElement('span');
      span.innerHTML = t;
      domWeek.appendChild(span);
    });
    var funcAddMonth = function () {
      months.forEach(function (t) {
        var li = document.createElement('li');
        li.innerHTML = t;
        _oYears_months_ul.appendChild(li);
      });
    };
    funcAddMonth();
    funcAddMonth();
    funcAddMonth();
  }
});
