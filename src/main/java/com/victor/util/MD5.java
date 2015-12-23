package com.victor.util;


import org.apache.log4j.Logger;

import java.util.Random;


public class MD5 {

    public static Logger logger = Logger.getLogger("WEB-APP");   //��־��¼

    public MD5() {

    }

    public static String encode(String myinfo) {
        byte[] digesta = null;
        try {
            java.security.MessageDigest alga = java.security.MessageDigest.
                    getInstance("MD5");
            alga.update(myinfo.getBytes());
            digesta = alga.digest();

        } catch (java.security.NoSuchAlgorithmException ex) {
        }
        return byte2hex(digesta);
    }


    public static String encode(String myinfo, String encode) {
        byte[] digesta = null;
        try {
            java.security.MessageDigest alga = java.security.MessageDigest.
                    getInstance("MD5");
            alga.update(myinfo.getBytes(encode));
            digesta = alga.digest();

        } catch (Exception ex) {
        }
        return byte2hex(digesta);
    }


    public static String byte2hex(byte[] b) { //������ת�ַ�??
        String hs = "";
        String stmp = "";
        for (int n = 0; n < b.length; n++) {
            stmp = (Integer.toHexString(b[n] & 0XFF));
            if (stmp.length() == 1) {
                hs = hs + "0" + stmp;
            } else {
                hs = hs + stmp;
            }
            if (n < b.length - 1) {
            }
        }
        return hs;
    }

    /**
     * Copyright (c) 2013  ����լ��� All rights reserved
     *
     * @return :
     * @author : �ֽ�
     * @createTime : 2013-7-24
     * @version : 1.0
     * @comments : ȡ�����Կ
     * @params :
     * @requestNum :
     * @documentPath:
     */
    public static String genRandomNums(int count) {


        char[] str = {'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
                'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
                'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};

        Random r = new Random();

        int i = 0;
        StringBuffer sb = new StringBuffer();
        while (i < count) {
            i++;
            int num = Math.abs(r.nextInt(36));
            sb.append(str[num]);
        }

        return sb.toString();


    }

    //25d55ad283aa400af464c76d713c07ad||||||||||X
    public static void main(String[] args) {

        MD5 te = new MD5();

        String aa = "ks6543217";
        //�ֻ�
        String s = "agentid=test_agent_id_1&source=esales&mobilenum=15850528638&merchantKey=111111";
        //��Ϸ
        String s1 = "commandid=gamequery&protocolid=normal&merchantid=zhaishenghuo&version=1&mark=&merchantKey=q2cz6k9r5v1l1x1ezzapd1vgc4pmr45p0xhs0e59qhcexev9sz1nwl61kpzekia6w24b9k7s6y3at1dmov6prrye17483vesey7lg79vxabp45ol5b43v8jh2vzevf1x";
        //�ɳ�ֵ��Ϸ��ѯ�ӿ�У��
        String s2 = "<?xml version=\"1.0\" encoding=\"GBK\"?><response><code>0</code><gameinfolist><gameinfo><gameid>GAME30196</gameid><gamename>�������online</gamename></gameinfo><gameinfo><gameid>GAME30193</gameid><gamename>����Y??/gamename></gameinfo><gameinfo><gameid>GAME27380</gameid><gamename>����??/gamename></gameinfo><gameinfo><gameid>GAME51189</gameid><gamename>QQ����(??</gamename></gameinfo><gameinfo><gameid>GAME0013</gameid><gamename>��������</gamename></gameinfo><gameinfo><gameid>GAME5781</gameid><gamename>QQ����</gamename></gameinfo><gameinfo><gameid>GAME5581</gameid><gamename>Q??/gamename></gameinfo><gameinfo><gameid>GAME0133</gameid><gamename>�ɾ���˵</gamename></gameinfo><gameinfo><gameid>GAME4980</gameid><gamename>Q??/gamename></gameinfo><gameinfo><gameid>GAME23782</gameid><gamename>������2(����)</gamename></gameinfo><gameinfo><gameid>GAME36781</gameid><gamename>51����??/gamename></gameinfo><gameinfo><gameid>GAME1147</gameid><gamename>���??/gamename></gameinfo><gameinfo><gameid>GAME51196</gameid><gamename>�����澭</gamename></gameinfo><gameinfo><gameid>GAME51192</gameid><gamename>QQ����(??</gamename></gameinfo><gameinfo><gameid>GAME51188</gameid><gamename>���³�����ʿDNF����(??</gamename></gameinfo></gameinfolist></response>";
        String sign = te.encode("123456" + te.encode(s2 + "&123456") + "123456");

        //aa = te.encode(sign);

        System.out.println(sign);


        try {
            String bb = "%E6%B5%8B%E8%AF%95%7C1%7C%E5%A4%A7%E8%A1%A3%7C0";
            String dd = java.net.URLEncoder.encode(bb, "UTF-8");
            System.out.println(dd);
            String cc = te.encode(dd, "UTF-8");
            System.out.println("--->" + cc);


            System.out.println(java.net.URLDecoder.decode(bb, "UTF-8"));
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }


        //te.jsonTest();
        //te.splitTest();


    }
}

