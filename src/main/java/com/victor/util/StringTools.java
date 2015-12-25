package com.victor.util;

import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringTools {
    public static NumberFormat NUM_FMT_INT_FLT = NumberFormat
            .getNumberInstance();
    public static NumberFormat NUM_FMT_PER = NumberFormat.getPercentInstance();
    public static Pattern INTEGER = Pattern.compile("\\d*");
    public static Pattern NUMBER = Pattern.compile("^\\d+[.\\d]?\\d*$");

    public static String valueOf(Object obj) {
        return obj == null ? "" : obj.toString();
    }

    public static String notNull(String strValue) {
        return notNull(strValue, "");
    }

    public static String notNull(String strValue, String strDefault) {
        if (strValue == null || "".equals(strValue)) {
            return strDefault;
        }
        return strValue;
    }

    public static int parseInt(String inputNumber, int defaultNum) {
        if (inputNumber == null)
            return defaultNum;
        int temp = defaultNum;
        try {
            temp = Integer.parseInt(inputNumber.trim());
        } catch (Exception ex) {
            temp = defaultNum;
        }
        return temp;
    }

    public static double parseDouble(String value, double defaultNum) {
        if ((value == null) || ("".equals(value))) {
            return defaultNum;
        }
        double temp = defaultNum;
        try {
            temp = Double.parseDouble(value);
        } catch (Exception ex) {
            temp = defaultNum;
        }
        return temp;
    }

    public static long parseLong(String value, long defaultNum) {
        if ((value == null) || ("".equals(value))) {
            return defaultNum;
        }
        long temp = defaultNum;
        try {
            temp = Long.parseLong(value);
        } catch (Exception ex) {
            temp = defaultNum;
        }
        return temp;
    }

    public static String toString(String[] args, String split) {
        if (args == null)
            return "";
        String strRet = "";
        for (int i = 0; i < args.length; i++) {
            if (i == 0)
                strRet = args[i];
            else {
                strRet = strRet + split + args[i];
            }
        }
        return strRet;
    }

    public static String toString(Object[] args, String split) {
        if (args == null)
            return "";
        String strRet = "";
        for (int i = 0; i < args.length; i++) {
            if (i == 0)
                strRet = valueOf(args[i]);
            else {
                strRet = strRet + split + args[i];
            }
        }
        return strRet;
    }

    public static String toString(int[] args, String split) {
        if (args == null)
            return "";
        String strRet = "";
        for (int i = 0; i < args.length; i++) {
            if (i == 0)
                strRet = String.valueOf(args[i]);
            else {
                strRet = strRet + split + args[i];
            }
        }
        return strRet;
    }

    public static String toString(char[] args, String split) {
        if (args == null)
            return "";
        String strRet = "";
        for (int i = 0; i < args.length; i++) {
            if (i == 0)
                strRet = String.valueOf(args[i]);
            else {
                strRet = strRet + split + args[i];
            }
        }
        return strRet;
    }

    public static List parseString(String parseValue, Pattern p) {
        List lisRet = new ArrayList();
        Matcher m = p.matcher(parseValue);
        while (m.find()) {
            lisRet.add(m.group(1));
        }
        return lisRet;
    }

    public static List parseString(String parseValue, String p) {
        List lisRet = new ArrayList();
        String str = parseValue;

        if (str.indexOf(p) >= 0) {
            while (str.indexOf(p) >= 0)
                if (str.indexOf(p) == 0) {
                    str = str.substring(1);
                } else {
                    int i = str.indexOf(p);

                    String str1 = str.substring(0, i);

                    lisRet.add(str1);
                    str = str.substring(i + 1);
                    if (str.indexOf(p) < 0)
                        lisRet.add(str);
                }
        }
        return lisRet;
    }

    public static String toPercentString(String value) {
        return toPercentString(value, 2, 2);
    }

    public static String toPercentString(String value, int maxFraction,
                                         int minFraction) {
        try {
            double dValue = Double.parseDouble(value);
            NUM_FMT_PER.setMaximumFractionDigits(maxFraction);
            NUM_FMT_PER.setMinimumFractionDigits(minFraction);
            value = NUM_FMT_PER.format(dValue);
        } catch (Exception e) {
            return value;
        }
        return value;
    }

    public static String format(double formatNum, int maxDigit) {
        String value = String.valueOf(formatNum);
        try {
            NUM_FMT_INT_FLT.setMinimumFractionDigits(maxDigit);
            NUM_FMT_INT_FLT.setMaximumFractionDigits(maxDigit);
            value = NUM_FMT_INT_FLT.format(formatNum);
        } catch (Exception e) {
            return value;
        }
        return value;
    }

    /**
     * 把string array or list用给定的符号symbol连接成一个字符串
     *
     * @param array
     * @param symbol
     * @return
     */

    public static String joinString(List array, String symbol) {

        String result = "";

        if (array != null) {

            for (int i = 0; i < array.size(); i++) {

                String temp = array.get(i).toString();

                if (temp != null && temp.trim().length() > 0)

                    result += (temp + symbol);

            }

            if (result.length() > 1)

                result = result.substring(0, result.length() - 1);

        }

        return result;

    }


    public static String joinString(Map map) {

        Map results = new HashMap() {
            @Override
            public String toString() {
                StringBuffer result = new StringBuffer();
                // TODO Auto-generated method stub
                Iterator iterator = this.entrySet().iterator();
                while (iterator.hasNext()) {
                    Map.Entry entry = (Map.Entry) iterator.next();
                    String key = (String) entry.getKey();
                    String value = (String) entry.getValue();
                    result.append(key + '=' + value + '&');
                }

                return result.toString().substring(0, result.length() - 1);
            }

        };

        results.putAll(map);

        return results.toString();
    }

    public static String format(String formatNum, int maxDigit) {
        if ((formatNum == null) || (formatNum.length() <= 0))
            return formatNum;
        return format(parseDouble(formatNum, 0.0D), maxDigit);
    }

    public static boolean isInteger(String str) {
        Matcher m = INTEGER.matcher(str);
        return m.matches();
    }

    public static boolean isNumber(String str) {
        Matcher m = NUMBER.matcher(str);
        return m.matches();
    }

    public static String removeChar(String old) {
        return old.replaceAll("[\\s|\r|\t|\n]", "");
    }

    public static String[] removeForIndex(String[] str, int index) {

        String tmp[] = new String[str.length - 1];
        for (int i = 0; i < str.length; i++) {

            if (i < index) {
                tmp[i] = str[i];
            } else {

                if ((i + 1) == str.length) {
                    break;
                } else {
                    tmp[i] = str[i + 1];
                }

            }

        }

        return tmp;
    }


    public static List<String> removeForIndexList(String[] str, int index) {


        List<String> list = new ArrayList<String>();
        for (int i = 0; i < str.length; i++) {

            if (i < index) {

                list.add(str[i]);

            } else break;

        }

        return list;

    }

    public static boolean isEmpty(String str) {
        if (str == null || str.trim().length() == 0) {
            return true;
        } else {
            return false;
        }
    }

    public static boolean isNotEmpty(String str) {
        if (str == null || str.trim().length() == 0||"null".equals(str)) {
            return false;
        } else {
            return true;
        }
    }


    public static void main(String[] args) {

        Map map = new HashMap();
        map.put("operator", "24567");
        map.put("operator2", "245672");
        System.out.println(StringTools.joinString(map));
        ;
        String[] s = StringTools.removeForIndex("a,b,c".split(",", -1), 2);
        for (String i : s) {

            System.out.println(i);
        }


        List list = StringTools.removeForIndexList("a,b,c".split(",", -1), 2);
        System.out.println(StringTools.joinString(list, "|"));


        for (String i : s) {

            System.out.println(i);
        }
        Object[] obj = new Object[]{"1", "2"};
        Arrays.fill(obj, 0, 1, "|");
        for (Object i : obj) {

            System.out.println(i);
        }

    }

}

/*
 * Location: E:\我的文档\支付宝\classes\ Qualified Name: market.util.StringTools
 * JD-Core Version: 0.6.0
 */