
function Backlog() {
  
  this.ajaxBase = {
    url:      null, // バックログスペースURL  ex. https://your_space.backlog.jp/XML-RPC
    username: null, // Basic認証用
    password: null, // Basic認証用
    timeout:  3000, // タイムアウト（ミリ秒）
    
    type: 'POST',
    contentType: 'text/xml;charset=UTF-8',
    data: null,
    dataType: 'xml',
    async: false,
    success: function () {
      
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      throw(textStatus + ':' + errorThrown);
    }
  };
  
  // 初期化
  this.init = function (option) {
    this.ajaxBase.url      = 'https://' + option.space + '.backlog.jp/XML-RPC';
    this.ajaxBase.username = option.username;
    this.ajaxBase.password = option.password;
  }
  
  // Ajax
  this.ajax = function (opt) {
    $.ajax($.extend(this.ajaxBase, opt));
  }
  
  // プロジェクト一覧取得
  this.getProjects = function () {
    
    var projects = new Array();
    
    var request = '<?xml version="1.0" encoding="utf-8"?>'
                + '<methodCall>'
                +   '<methodName>backlog.getProjects</methodName>'
                +   '<params />'
                + '</methodCall>';
    
    this.ajax({
      data: request,
      success: function(data, status, xhr) {
        $(data).find('methodResponse params param value array data value struct').each(function(){
          var member = {};
          $(this).find('member').each(function(){
            var name = $(this).find('name').text();
            var value = $(this).find('value').text();
            member[name] = value;
          });
          projects.push(member);
        });
      }
    });
    
    return projects;
  }
  
  // ユーザ一覧取得
  this.getUsers = function (projects) {
    
    var backlog = this;
    var users = new Array();
    var userMap = {};
    
    $.each(projects, function(){
      
      var project = this;
      
      var request = '<?xml version="1.0" encoding="utf-8"?>'
                  + '<methodCall>'
                  +   '<methodName>backlog.getUsers</methodName>'
                  +   '<params>'
                  +     '<param>'
                  +       '<value>'
                  +         '<int>' + project.id + '</int>'
                  +       '</value>'
                  +     '</param>'
                  +   '</params>'
                  + '</methodCall>';
      
      backlog.ajax({
        data: request,
        success: function(data, status, xhr) {
          $(data).find('methodResponse params param value array data value struct').each(function(){
            var member = {};
            
            $(this).find('member').each(function(){
              var name = $(this).find('name').text();
              var value = $(this).find('value').text();
              member[name] = value;
            });
            
            if (!userMap[member.id]) {
              userMap[member.id] = member;
              users.push(member);
            }
          });
        }
      });
    
    });
    
    return users;
  }
  
  // ユーザ情報取得
  this.getHoge = function () {}
  
  this.getUser = function (username) {
    
    var request = '<?xml version="1.0" encoding="utf-8"?>'
                + '<methodCall>'
                +   '<methodName>backlog.getUser</methodName>'
                +     '<params>'
                +       '<param>'
                +         '<value>'
                +           '<string>' + username + '</string>'
                +         '</value>'
                +       '</param>'
                +     '</params>'
                + '</methodCall>';
    
    var user = {};
    
    this.ajax({
      data: request,
      success: function(data, status, xhr) {
        
        $(data).find('member').each(function(){
          var name = $(this).find('name').text();
          var value = $(this).find('value').text();
          user[name] = value;
        });
        
      }
    });
    
    return user;
  }
  
  this.countIssue = function (due, statuses, projects, assigners) {
    
    var count = 0;
    
    var backlog = this;
    
    var status;
    
    if (statuses.length > 0) {
      status = 
          '<member><name>statusId</name><value><array><data>'
        + $.map(statuses, function(n, i){ return '<value><int>' + n + '</int></value>' }).join('')
        + '</data></array></value></member>';
    }
    
    var assigner;
    
    if (assigners.length > 0) {
      assigner = 
          '<member><name>assignerId</name><value><array><data>'
        + $.map(assigners, function(n, i){ return '<value><int>' + n + '</int></value>' }).join('')
        + '</data></array></value></member>';
    }
    
    var due_date = '';
    
    // 1: 期限なし, 2: 期限切れ + 今日
    if (parseInt(due) == 2) {
      
      var today = new Date;
      yy = today.getYear();
      mm = today.getMonth() + 1;
      dd = today.getDate();
      if (yy < 2000) { yy += 1900; };
      if (mm < 10)   { mm = '0' + mm; };
      if (dd < 10)   { dd = '0' + dd; };
      
      var due_date_max = yy.toString() + mm.toString() + dd.toString();
      
      due_date = 
                    '<member>'
        +             '<name>due_date_min</name>'
        +             '<value>'
        +               '<string>19700101</string>'
        +             '</value>'
        +           '</member>'
        +           '<member>'
        +             '<name>due_date_max</name>'
        +             '<value>'
        +               '<string>' + due_date_max + '</string>'
        +             '</value>'
        +           '</member>';
    }
    
    $.each(projects, function(){
      
      var project = this;
      
      var request = '<?xml version="1.0" encoding="utf-8"?>'
                  + '<methodCall>'
                  +   '<methodName>backlog.countIssue</methodName>'
                  +   '<params>'
                  +     '<param>'
                  +       '<value>'
                  +         '<struct>'
                  +           '<member>'
                  +             '<name>projectId</name>'
                  +             '<value>'
                  +               '<int>' + project + '</int>'
                  +             '</value>'
                  +           '</member>'
                  + status
                  + assigner
                  + due_date
                  +         '</struct>'
                  +       '</value>'
                  +     '</param>'
                  +   '</params>'
                  + '</methodCall>';
      
      backlog.ajax({
        data: request,
        success: function(data, status, xhr) {
          count = count + parseInt($(data).find('i4').text());
        }
      });
      
    });
    
    return count;
  }
}


