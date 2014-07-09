//var initUrls=[{url:"/portal/subject/8_s0_g0_v0",stage:'小学教育',subject:'语文',version:'人教版',grade:'一年级上'}];
var initUrls=[{url:"/portal/subject/9_s0_g0_v0",stage:'初中教育',subject:'语文',version:'人教版',grade:'七年级上'}];//,
//var initUrls=[ {url:'/portal/subject/31_s0_g0_v0',stage:'高中教育',subject:'语文',version:'人教版',grade:'必修1'}];
//var initUrls=[                {url:"/portal/subject/8_s0_g0_v0",stage:'小学教育',subject:'语文',version:'人教版',grade:'一年级上'},                {url:"/portal/subject/9_s0_g0_v0",stage:'初中教育',subject:'语文',version:'人教版',grade:'七年级上'},                {url:'/portal/subject/31_s0_g0_v0',stage:'高中教育',subject:'语文',version:'人教版',grade:'必修1'}];
var pageList={};
var requestedList={};
var arrayList=[];
var total=0;
var $ = require('jQuery');
var events=require('events');
var event=new events.EventEmitter();

var ev_num=0;


task(initUrls);
//testAjax();
//testJson();

function testJson(){
    console.log('a2')
    $.getJSON("http://q.yanxiu.com/ya/queryReplies.tc?aid=26967&toolid=70441&topicid=366612109827876&pageSize=10000",
        {
            sendTime:(new Date()).getTime()
        },
        function(data) {
            if (data.status == 1) {
                //alert(json.responseMsg);
                $.each(data.replies,function(idx,item){

                    var line=item.userName+":"+item.content;
                    line+='\n'+'留言时间：'+item.time;
                    line+='\n'+'--------------';
                    console.log(line);

                });
            } else {
                console.log("\u64cd\u4f5c\u5931\u8d25\uff01");
            }
    });



    console.log('b2')

}
function testAjax(){
    console.log("begin test Jax;");

    $.ajax({
        url: "http://q.yanxiu.com/ya/queryReplies.tc?aid=26967&toolid=70441&topicid=366612109827876&pageSize=10000",
        dataType:'json',
        type: "get",
        success: function(data) {
            //var iconv = require('iconv').Iconv;
            var iconv = require('iconv-lite');
           // var html_utf8 = (new iconv('GBK', 'UTF-8')).convert(new Buffer(response)).toString();

            var jschardet = require("jschardet")
            var encoding = require('encoding');
            //console.log(response)
            //console.log("2"+encoding.convert(response, 'utf8', 'GBK'));
            console.log(data.page);
            $.each(data.replies,function(idx,item){

                var line=item.userName+":"+item.content;
                line+='\n'+'留言时间：'+item.time;
                line+='\n'+'--------------';
                console.log(line);

            });
        },
        error: function(a, b, c) {
            for(var i in a){
                console.log(a[i]);
            }
            console.log("err"+a+b+c);
        }
    });
}
function task(urllist){
    event.on("finish",function(){
        console.log("恭喜,处理完毕!");
    });
    var fs=require('fs');
    fs.exists('wenku.sql',function(isExist){
        if(isExist){
            //fs.unlink('wenku.sql', function(){
               // console.log('success');
           // });
        }

    });
    initPageList(urllist);
}

function initPageList(urllist){
    urllist.forEach(function(urlObj){
        requestedList[urlObj.url]=urlObj;
        initOneUrl(urlObj);
        //$.get("http://wenku.baidu.com"+urlObj.url,function(html){
        //    console.log(html);
        //});
        /*
        var html='';
        $.ajax({
            url: "http://wenku.baidu.com"+urlObj.url,
            contenttype: "application/x-www-form-urlencoded; charset=GBK",
            type: "get",
            success: function(response) {
                var iconv = require('iconv').Iconv;
                var html_utf8 = (new iconv('GBK', 'UTF-8')).convert(new Buffer(response, 'binary')).toString();
                console.log("2"+html_utf8);
            },
            error: function(a, b, c) {
                //console.log("1"+html);
            }
        });
        */

    });
}
function  initOneUrl(urlObj){
    ev_num++;

    var http = require("http");
    var iconv = require('iconv').Iconv;
    // 构造请求信息
    var options = {
        hostname : 'wenku.baidu.com',
        port : 80,
        path : urlObj.url,
        method : 'GET'
    };
    var req = http.request(options, function(res) {

        var html = '';
        res.setEncoding('binary');
        res.on('data', function(chunk) {
            html += chunk;
            // console.log(chunk);
        });
        res.on('end', function() {
            // console.log(html);
            var html_utf8 = (new iconv('GBK', 'UTF-8')).convert(new Buffer(html, 'binary')).toString();

           //akeDom(html_utf8,callbackInitUrl,urlObj);
           handleWithJquery(html_utf8,urlObj);
        });
    });
    req.end();
}

function handleWithJquery(html,urlObj){

    var $doc=$(html);
    //console.log("---mext url"+urlObj.url+"---response-----------------------------------------");
    if(pageList[urlObj.url]){console.log(urlObj.url+'   !!!!==============!!! have getetd');return;};//此页面已经处理过
    //处理当前页链接
    var obj={stage:urlObj.stage,url:urlObj.url};
    var list = $doc.find("div#select-all dt");
    list.each(function (index,e){
        var e=$(e);
        if(e.text()=='科目'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.subject= a.text();
        }
        if(e.text()=='版本'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.version= a.text();
        }
        if(e.text()=='年级'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.grade= a.text();
        }
    });
    pageList[obj.url]=obj;

    var category=$doc.find('#unit-list li.unit-item');
    category.each(function(index,e){
        var cate=$(this);
        var unit=cate.find('>a').first();
        if(!unit.hasClass('unit-link-all-resourse')){//不是全部资源选项
            var fs=require('fs');
            var lessionList=cate.find('>ul.lesson-list>li.lesson-item>a');
            obj.unit=unit.text();
            //把章放入数据库
            for(var i in obj){
                obj[i]=obj[i].replace(/\'/g, '\\\'');
                obj[i]=obj[i].replace(/\"/g, '\\\"');
            }
            var row =String.format("INSERT INTO `category` VALUES (NULL, '{0}', '{1}', '{2}', '{3}', '{4}', NULL, NULL);",obj.stage, obj.subject,obj.version,obj.grade,obj.unit );
            console.log(row);
            fs.appendFileSync('wenku.sql', row + '\r\n');
            lessionList.each(function (index,e){
                var a=$(this);
                obj.lesson= a.text();
                for(var i in obj){
                    obj[i]=obj[i].replace(/\'/g, '\\\'');
                    obj[i]=obj[i].replace(/\"/g, '\\\"');
                }
                var row =String.format("INSERT INTO `category` VALUES (NULL, '{0}', '{1}', '{2}', '{3}', '{4}', '{5}', NULL);",obj.stage, obj.subject,obj.version,obj.grade,obj.unit,obj.lesson );
                console.log(row);
                fs.appendFileSync('wenku.sql', row + '\r\n');
            });
        };
    });


    list = $doc.find("div#select-all dd div.sel-list ul li:not(.selected) a");
    list.each(function(index,e){
        var a=$(e);
        //console.log("item:"+a.text()+' '+a.attr('href')+' '+ a.parent().hasClass('selected'));
        if(!requestedList[a.attr('href')]){
            //console.log("---mext url"+a.attr('href')+"---request-----------------------------------------");
            requestedList[a.attr('href')]={url:a.attr('href'),stage:urlObj.stage};
            arrayList.push({url:a.attr('href'),stage:urlObj.stage});
            initOneUrl({url:a.attr('href'),stage:urlObj.stage});
        }
    });
    if(arrayList.length>0){
        //initOneUrl(arrayList.shift());
    }


    var j=0;
    for(var i in requestedList) j++;
    total++;
    ev_num--;
    /*
     console.log(obj);
     console.log("requestedList length:"+j);
     console.log("    arrayList length:"+arrayList.length);
     console.log("               total:"+total);
    */
    console.log("******************************to to task number:"+ev_num+'******************************');

    if(ev_num<=0){
        event.emit('finish');
    }
}

function callbackInitUrl(errors, $,urlObj) {
    //console.log("---mext url"+urlObj.url+"---response-----------------------------------------");
    if(pageList[urlObj.url]){console.log(urlObj.url+'   !!!!==============!!! have getetd');return;};//此页面已经处理过
    //处理当前页链接
    var obj={stage:urlObj.stage,url:urlObj.url};
    var list = $("div#select-all dt");
    list.each(function (index,e){
        var e=$(e);
        if(e.text()=='科目'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.subject= a.text();
        }
        if(e.text()=='版本'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.version= a.text();
        }
        if(e.text()=='年级'){
            var a=e.parent().find('dd .sel-list li.selected a').first();
            obj.grade= a.text();
        }
    });
    pageList[obj.url]=obj;

    var category=$('#unit-list li.unit-item');
    category.each(function(index,e){
        var cate=$(this);
        var unit=cate.find('>a').first();
        if(!unit.hasClass('unit-link-all-resourse')){//不是全部资源选项
            var lessionList=cate.find('>ul.lesson-list>li.lesson-item>a');
            obj.unit=unit.text();
            //把章放入数据库
            for(var i in obj){
                obj[i]=obj[i].replace(/\'/g, '\\\'');
                obj[i]=obj[i].replace(/\"/g, '\\\"');
            }
            var row =String.format("INSERT INTO `category` VALUES (NULL, '{0}', '{1}', '{2}', '{3}', '{4}', NULL, NULL);",obj.stage, obj.subject,obj.version,obj.grade,obj.unit );
            console.log(row);
            fs.appendFileSync('wenku.sql', row + '\r\n');
            lessionList.each(function (index,e){
                var a=$(this);
                obj.lesson= a.text();
                for(var i in obj){
                    obj[i]=obj[i].replace(/\'/g, '\\\'');
                    obj[i]=obj[i].replace(/\"/g, '\\\"');
                }
                var row =String.format("INSERT INTO `category` VALUES (NULL, '{0}', '{1}', '{2}', '{3}', '{4}', '{5}', NULL);",obj.stage, obj.subject,obj.version,obj.grade,obj.unit,obj.lesson );
                console.log(row);
                fs.appendFileSync('wenku.sql', row + '\r\n');
            });
        }
    });


    /*
    var j=0;
    for(var p in requestedList)
    {
        j++;
        console.log("requestList:"+j+"#"+requestedList[p].url);
    }
    j=0;
    for(var p in pageList)
    {
        j++;
        console.log("pageList:"+j+"#"+pageList[p].url);
    }
    */
    //处理当前页其他链接

    list = $("div#select-all dd div.sel-list ul li:not(.selected) a");
    list.each(function(index,e){
        var a=$(e);
        //console.log("item:"+a.text()+' '+a.attr('href')+' '+ a.parent().hasClass('selected'));
        if(!requestedList[a.attr('href')]){
            //console.log("---mext url"+a.attr('href')+"---request-----------------------------------------");
            requestedList[a.attr('href')]={url:a.attr('href'),stage:urlObj.stage};
            arrayList.push({url:a.attr('href'),stage:urlObj.stage});
            //initOneUrl({url:a.attr('href'),stage:urlObj.stage});
        }
    });
    if(arrayList.length>0){
        initOneUrl(arrayList.shift());
    }
    var j=0;
    for(var i in requestedList) j++;
    total++;
    /*
    console.log(obj);
    console.log("requestedList length:"+j);
    console.log("    arrayList length:"+arrayList.length);
    console.log("               total:"+total);
    */
};


/**
 * 使用jsdom将html跟jquery组装成dom
 * 
 * @param {[type]}
 *            html 需要处理的html
 * @param {Function}
 *            callback 组装成功后将html页面的$对象返回
 * @return {[type]} [description]
 */
function makeDom(html, callback,urlObj) {
    fs = require('fs');
    var jsdom = require('jsdom').jsdom, jquery = fs.readFileSync("./jquery-1.7.2.min.js", "utf-8");

    jsdom.env({
		html : html,
		src : [ jquery ],
		done : function(errors,window ) {
			var $ = window.$;
			callback(errors, $,urlObj);
			window.close(); // 释放window相关资源，否则将会占用很高的内存
		}
	});
}



String.format = function() {

    var s = arguments[0];

    for (var i = 0; i < arguments.length - 1; i++) {

        var reg = new RegExp("\\{" + i + "\\}", "gm");

        s = s.replace(reg, arguments[i + 1]);

    }

    return s;

};
/*
$.get("http://q.yanxiu.com",function(html){

    var $doc = $(html);

    console.log("No.  name  language  star   forks  ")

    $doc.find(".nr").each(function(i,project){
        console.log($(this).text());
        var $project = $(project);

        var name = $project.find("h3").text().trim();

        var language = $project.find("li:eq(0)").text().trim();

        var star = $project.find("li.stargazers").text().trim();

        var forks = $project.find("li.forks").text().trim();

        var row =String.format("{4} {0}  {1}  {2}  {3}",name, language,star,forks,i + 1 );

        console.log(row);

    });

});
 */