/**
*下面是JS实现克隆的方法。转载的
*这个方法比较好。利用了递归，实现了深度克隆。
*克隆在日常的JS操作中我觉得还是比较常见的。留下备用。。
*/
<SCRIPT language="JavaScript" type="text/JavaScript">
<!--
//Clone
Object.prototype.Clone = function(){
var objClone;
if (this.constructor == Object){
objClone = new this.constructor();
}else{
objClone = new this.constructor(this.valueOf());
}
for(var key in this){
if ( objClone[key] != this[key] ){
if ( typeof(this[key]) == 'object' ){
objClone[key] = this[key].Clone();
}else{
objClone[key] = this[key];
}
}
}
objClone.toString = this.toString;
objClone.valueOf = this.valueOf;
return objClone;
}


//调用测试方法
function printMessage() {

function Person(name,age,gender) {
this.name=name;
this.age=age;
this.gender=gender;
this.friends={fisrt:'jerry',second:'franck',third:'jack'};
this.clickMe=function() {
alert('If you click me, I\'ll say: i\'m '+this.name+', Thank you!');
}
}

var p = new Person('xiaozhang','29','man');
var pAfterClone = p.Clone();
alert(p.name+"------"+pAfterClone.name);
alert(p.friends.second+"------"+pAfterClone.friends.second);
pAfterClone.friends.second= 'james';
alert(p.friends.second+"------"+pAfterClone.friends.second);


}

//-->
</SCRIPT>
