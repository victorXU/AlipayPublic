/*==============================================================*/
/* DBMS name:      ADABAS D                                     */
/* Created on:     2015/12/9 23:26:16                           */
/*==============================================================*/


drop table course_info;

drop index evluate_target_id;

drop table evaluate_info;

drop table order_info;

drop table show_info;

drop table student_info;

drop table teacher_info;

drop table user_info;

/*==============================================================*/
/* Table: course_info                                           */
/*==============================================================*/
create table course_info (
course_id integer(11) not null,
course_name varchar(255) not null,
course_detail varchar(2048),
course_pric varchar(255),
salse_num integer(11)  default '0',
course_type integer(3),
status integer(1) not null default '1',
addtime integer(11) not null,
updatetime integer(11),
primary key (course_id)
);

comment on table course_info is
'课程信息';

comment on column course_info.course_id is
'课程id';

comment on column course_info.course_name is
'课程名';

comment on column course_info.course_detail is
'课程简介';

comment on column course_info.course_pric is
'课程图片链接';

comment on column course_info.salse_num is
'销售数量';

comment on column course_info.course_type is
'课程类型【1：笔试，2：面试】';

comment on column course_info.status is
'状态【0：不可用，1：可用】';

comment on column course_info.addtime is
' 添加时间';

comment on column course_info.updatetime is
'修改时间';

/*==============================================================*/
/* Table: evaluate_info                                         */
/*==============================================================*/
create table evaluate_info (
evaluate_id integer(11) not null,
student_id integer(11) not null,
content varchar(2048) not null,
target_id integer(11) not null,
status integer(1) not null default '1',
addtime integer(11) not null,
updatetime integer(11),
primary key (evaluate_id)
);

comment on table evaluate_info is
'评价表';

comment on column evaluate_info.evaluate_id is
'评价id';

comment on column evaluate_info.student_id is
'评价人';

comment on column evaluate_info.content is
'内容';

comment on column evaluate_info.target_id is
'评价对象';

comment on column evaluate_info.status is
'状态【0：不可用，1：可用】';

comment on column evaluate_info.addtime is
' 添加时间';

comment on column evaluate_info.updatetime is
'修改时间';

/*==============================================================*/
/* Index: evluate_target_id                                     */
/*==============================================================*/
create  index evluate_target_id on evaluate_info (
target_id ASC
);

/*==============================================================*/
/* Table: order_info                                            */
/*==============================================================*/
create table order_info (
order_id integer(11) not null,
student_id integer(11) not null,
course_id integer(11) not null,
num integer(3) not null default '0',
price decimal(20.2) not null default 0.00,
status integer(1) not null default '1',
addtime integer(11) not null,
updatetime integer(11),
primary key (order_id)
);

comment on table order_info is
'订单表';

comment on column order_info.order_id is
'订单表';

comment on column order_info.student_id is
'学生id';

comment on column order_info.course_id is
'课程id';

comment on column order_info.num is
'数量';

comment on column order_info.price is
'价格';

comment on column order_info.status is
'状态【0：不可用，1：可用】';

comment on column order_info.addtime is
' 添加时间';

comment on column order_info.updatetime is
'修改时间';

/*==============================================================*/
/* Table: show_info                                             */
/*==============================================================*/
create table show_info (
info_id integer(11) not null,
info_content varchar(255) not null,
info_type integer(1) not null,
info_url varchar(255) not null,
status integer(1) not null default '1',
addtime integer(11) not null,
updatetime integer(11),
primary key (info_id)
);

comment on table show_info is
'展示信息表';

comment on column show_info.info_id is
'信息id';

comment on column show_info.info_content is
'信息内容';

comment on column show_info.info_type is
'信息类型【0：公告，1：成绩，2：公益，3：光荣榜，4：十年真题，5：菜鸟必读】';

comment on column show_info.info_url is
'信息链接';

comment on column show_info.status is
'信息状态 【0：不可用，1：可用】';

comment on column show_info.addtime is
' 添加时间';

comment on column show_info.updatetime is
'修改时间';

/*==============================================================*/
/* Table: student_info                                          */
/*==============================================================*/
create table student_info (
student_id integer(11) not null,
student_name varchar(64) not null,
telephone varchar(13) not null,
webchat_num varchar(64),
status integer(1) not null default '1',
addtime integer(11) not null,
updatetime integer(11),
primary key (student_id)
);

comment on table student_info is
'学生信息';

comment on column student_info.student_id is
'学生id';

comment on column student_info.student_name is
'学生姓名';

comment on column student_info.telephone is
'联系方式';

comment on column student_info.webchat_num is
' 微信号';

comment on column student_info.status is
'状态【0：不可用，1：可用】';

comment on column student_info.addtime is
' 添加时间';

comment on column student_info.updatetime is
'修改时间';

/*==============================================================*/
/* Table: teacher_info                                          */
/*==============================================================*/
create table teacher_info (
teacher_id integer(11) not null,
name varchar(255) not null,
sex varchar(4) not null,
status integer(1) not null default '1',
pic_url varchar(255),
qzone varchar(255),
wechat varchar(255),
weibo varchar(255),
actual_praise integer(3) not null,
simulate_praise integer(3),
teacher_detail varchar(2048),
audio_url varchar(225),
addtime integer(11) not null,
updatetime integer(11),
primary key (teacher_id)
);

comment on table teacher_info is
'教师信息';

comment on column teacher_info.teacher_id is
'教师id';

comment on column teacher_info.name is
'教师名字';

comment on column teacher_info.sex is
'性别';

comment on column teacher_info.status is
'状态【0：不可用，1：可用】';

comment on column teacher_info.pic_url is
'头像链接';

comment on column teacher_info.qzone is
'qq空间链接';

comment on column teacher_info.wechat is
'微信号';

comment on column teacher_info.weibo is
'微博';

comment on column teacher_info.actual_praise is
'实际点赞';

comment on column teacher_info.simulate_praise is
'模拟点赞';

comment on column teacher_info.teacher_detail is
' 教师简介';

comment on column teacher_info.audio_url is
'音频简介链接';

comment on column teacher_info.addtime is
' 添加时间';

comment on column teacher_info.updatetime is
'修改时间';

/*==============================================================*/
/* Table: user_info                                             */
/*==============================================================*/
create table user_info (
user_id integer(11) not null,
user_name varchar(255) not null,
password varchar(255) not null,
addtime integer(11) not null,
updatetime integer(11),
primary key (user_id)
);

comment on table user_info is
'用户信息表';

comment on column user_info.user_id is
'用户id';

comment on column user_info.user_name is
'登陆名';

comment on column user_info.password is
'密码';

comment on column user_info.addtime is
' 添加时间';

comment on column user_info.updatetime is
'修改时间';

