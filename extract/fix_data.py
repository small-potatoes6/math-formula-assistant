# -*- coding: utf-8 -*-
"""修复：1) \\square 紧贴字母导致命令粘连  2) ①②③ 圈号 KaTeX 无字形；然后重新注入原型"""
import json, re, io, os

BASE = os.path.dirname(os.path.abspath(__file__))
JF = os.path.join(BASE, "..", "prototype", "data", "公式库-全量.json")
P = os.path.join(BASE, "..", "prototype", "公式记忆助手-原型.html")

BS = chr(92)
data = json.load(io.open(JF, encoding="utf-8"))

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
def decircle(s):
    return re.sub("[" + CIRCLED + "]", lambda m: "(" + str(CIRCLED.index(m.group(0)) + 1) + ")", s)

n_sq = n_ci = 0
for it in data["items"]:
    for k in ("latex", "blankLatex"):
        t = it.get(k) or ""
        if not t:
            continue
        t2 = re.sub(re.escape(BS) + "square(?=[A-Za-z])", lambda m: BS + "square ", t)   # 修粘连
        t3 = decircle(t2)
        if t2 != t: n_sq += 1
        if t3 != t2: n_ci += 1
        it[k] = t3

print("修 \\square 粘连:", n_sq, "处 | 修圈号:", n_ci, "处")

json.dump(data, io.open(JF, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("写回:", os.path.abspath(JF))

# 重新注入 HTML 的 DATA 块
html = io.open(P, encoding="utf-8").read()
marker = "const DATA = "
s = html.index(marker)
e = html.find(";\r\n", s)
if e < 0:
    e = html.find(";\n", s)
assert e > 0, "未定位到 DATA 块结尾"
html = html[:s] + marker + json.dumps(data, ensure_ascii=False) + html[e:]
io.open(P, "w", encoding="utf-8").write(html)
print("已重新注入原型，大小:", os.path.getsize(P), "bytes")
