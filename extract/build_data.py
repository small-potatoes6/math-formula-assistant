# -*- coding: utf-8 -*-
"""合并 PDF 转录数据 -> 公式库-全量.json（标类型/年级/自动挖空）"""
import json, os
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))
E = os.path.join(BASE, "json")

items = []
for f in ["partA1.json", "partA2.json", "partA3.json", "partB1.json", "partB2.json"]:
    items += json.load(open(os.path.join(E, f), encoding="utf-8"))["items"]

# 1) 补全被截断的 C186（圆锥曲线弦长公式）
for x in items:
    if x["id"] == "C186":
        x["latex"] = ("|AB|=\\sqrt{1+k^2}\\,|x_1-x_2|"
                      "=\\sqrt{1+k^2}\\sqrt{(x_1+x_2)^2-4x_1x_2}"
                      "=\\sqrt{1+\\tfrac1{k^2}}\\,|y_1-y_2|")
        x["condition"] = "直线与曲线交于 A(x1,y1)、B(x2,y2)，斜率 k 存在"
        x["pitfall"] = "斜率不存在时用 |y1-y2| 形式；必须先联立求 x1+x2、x1x2"
        x["voiceText"] = ("弦长公式：弦长等于根号下一加k的平方乘以x1减x2的绝对值，"
                          "等于根号下一加k的平方乘以根号下x1加x2的平方减四倍x1乘x2；"
                          "也可以写成根号下一加k方分之一乘以y1减y2的绝对值。")
        x["tags"] = ["圆锥曲线", "弦长", "韦达定理"]

# 2) 章节归一化（B 部分章节并入 A 的统一体系）
CMAP = {
    "集合": "集合与常用逻辑用语", "不等式": "一元二次函数、方程和不等式",
    "函数": "函数的概念与性质", "三角": "三角函数", "三角恒等变换": "三角函数",
    "平面向量": "平面向量及其应用", "解三角形": "解三角形", "复数": "复数",
    "立体几何": "立体几何初步", "立体几何初步": "立体几何初步",
    "解析几何": "直线与圆的方程", "直线与圆": "直线与圆的方程",
    "圆锥曲线": "圆锥曲线的方程", "数列": "数列", "导数": "导数",
    "二项式": "排列组合与二项式定理", "排列组合": "排列组合与二项式定理",
    "概率统计": "随机变量及其分布列", "统计概率": "随机变量及其分布列",
}

# 3) 章节 -> 年级（人教A版编排）
G = {
    "集合与常用逻辑用语": "高一", "一元二次函数、方程和不等式": "高一",
    "函数的概念与性质": "高一", "三角函数": "高一", "平面向量及其应用": "高一",
    "解三角形": "高一", "复数": "高一", "立体几何初步": "高一", "概率与统计": "高一",
    "空间向量与立体几何": "高二", "直线与圆的方程": "高二", "圆锥曲线的方程": "高二",
    "数列": "高二", "导数": "高二", "排列组合与二项式定理": "高二",
    "随机变量及其分布列": "高二",
}

BS = chr(92)  # 反斜杠


def match_braces(s, i):
    """s[i] 应为 '{'，返回配对 '}' 的下标；失败返回 -1"""
    if i >= len(s) or s[i] != "{":
        return -1
    depth = 0
    while i < len(s):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def find_blocks(tex):
    """找出所有 \\frac{..}{..} 与 \\sqrt{..} 的 (start, end) 区间"""
    fracs, sqrts = [], []
    n = len(tex)
    i = 0
    while i < n:
        if tex.startswith(BS + "frac", i):
            a = tex.find("{", i)
            b = match_braces(tex, a)
            if b > 0:
                c = tex.find("{", b + 1)
                if c == b + 1:
                    d = match_braces(tex, c)
                    if d > 0:
                        fracs.append((i, d + 1))
                        i = d + 1
                        continue
            i += 5
        elif tex.startswith(BS + "sqrt", i):
            a = tex.find("{", i)
            b = match_braces(tex, a)
            if b > 0:
                sqrts.append((i, b + 1))
                i = b + 1
                continue
            i += 5
        else:
            i += 1
    return fracs, sqrts


def pick_blank(tex):
    """返回 (blankLatex, answer)；找不到合适块则 ('','')"""
    if not tex:
        return "", ""
    fracs, sqrts = find_blocks(tex)
    cand = [b for b in fracs if b[1] - b[0] >= 10] or \
           [b for b in sqrts if b[1] - b[0] >= 8]
    if not cand:
        return "", ""
    # 取中间那个（避免总挖开头）
    s, e = cand[len(cand) // 2]
    return tex[:s] + BS + "square" + tex[e:], tex[s:e]


out = []
for x in items:
    ch = CMAP.get(x["chapter"], x["chapter"])
    x["chapter"] = ch
    x["type"] = "conclusion" if x["id"][0] == "S" else "core"
    x["grade"] = G.get(ch, "高二")
    b, a = pick_blank(x.get("latex", ""))
    x["blankLatex"], x["blankAnswer"] = b, a
    out.append(x)

print("总数:", len(out), Counter(y["type"] for y in out))
print("类型×年级:", Counter((y["type"], y["grade"]) for y in out))
unmapped = sorted({y["chapter"] for y in out if y["chapter"] not in G})
print("未映射章节:", unmapped)
nb = [y["id"] for y in out if not y["blankLatex"]]
print("无填空版条目:", len(nb))

data = {
    "meta": {
        "source": "《高中数学253个核心知识点》+《高中数学常考二级结论113条》",
        "types": {"core": "核心公式", "conclusion": "二级结论"},
        "grades": ["高一", "高二", "全部"],
        "total": len(out),
    },
    "items": out,
}
dst = os.path.join(BASE, "..", "prototype", "data", "公式库-全量.json")
json.dump(data, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("写出:", os.path.abspath(dst), os.path.getsize(dst), "bytes")

# 抽样展示
for y in out:
    if y["blankLatex"]:
        print("样例", y["id"], "|", y["blankLatex"][:70], "|| 答案:", y["blankAnswer"][:40])
        break
