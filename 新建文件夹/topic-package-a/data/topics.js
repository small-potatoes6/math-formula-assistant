module.exports = {
  "modules": [
    {
      "id": "K01",
      "order": 1,
      "packageRoot": "topic-package-a",
      "visualTheme": "soft",
      "layoutVariant": "feature-cards",
      "title": "基本不等式、柯西不等式、权方和不等式",
      "sourcePages": [
        3,
        4
      ],
      "sections": [
        {
          "id": "K01-01",
          "title": "一、基本不等式",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、基本不等式"
            }
          ],
          "sourcePages": [
            3
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "基本不等式及几个重要的不等式："
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(1)\\sqrt{ab}\\le\\frac{a+b}{2}(a>0,b>0);",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b02-f-0001-p01.svg",
                  "width": 232,
                  "height": 47
                },
                {
                  "latex": "(2)a+b\\ge2\\sqrt{ab}(a>0,b>0);",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b02-f-0001-p02.svg",
                  "width": 233,
                  "height": 34
                },
                {
                  "latex": "(3)a^2+b^2\\ge2ab;",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b02-f-0001-p03.svg",
                  "width": 134,
                  "height": 32
                },
                {
                  "latex": "(4)\\frac{b}{a}+\\frac{a}{b}\\ge2(ab\\ne0,\\text{且 }a,b\\text{同号});",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b02-f-0001-p04.svg",
                  "width": 267,
                  "height": 48
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(5)ab\\le\\left(\\frac{a+b}{2}\\right)^2;",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b03-f-0002-p01.svg",
                  "width": 151,
                  "height": 57
                },
                {
                  "latex": "(6)\\left(\\frac{a+b}{2}\\right)^2\\le\\frac{a^2+b^2}{2};",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b03-f-0002-p02.svg",
                  "width": 194,
                  "height": 57
                },
                {
                  "latex": "(7)\\sqrt{\\frac{a^2+b^2}{2}}\\ge\\frac{a+b}{2}\\ge\\sqrt{ab}\\ge",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b03-f-0002-p03.svg",
                  "width": 246,
                  "height": 54
                },
                {
                  "latex": "\\frac{2}{\\frac1a+\\frac1b}(a>0,b>0).",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b03-f-0002-p04.svg",
                  "width": 168,
                  "height": 55
                }
              ]
            },
            {
              "type": "note",
              "segments": [
                {
                  "type": "text",
                  "text": "注：以上不等式均在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b04-i01.svg",
                  "width": 47,
                  "height": 26,
                  "displayWidth": 81,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "时取等号."
                }
              ]
            },
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "常用模型"
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\text{模型一：}mx+\\frac{n}{x}\\ge",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b06-f-0004-p01.svg",
                  "width": 158,
                  "height": 43
                },
                {
                  "latex": "2\\sqrt{mn}(m>0,n>0,x>0),",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b06-f-0004-p02.svg",
                  "width": 218,
                  "height": 32
                },
                {
                  "latex": "\\text{当且仅当 }x=\\sqrt{\\frac{n}{m}}\\text{ 时，等号成立}.",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b06-f-0004-p03.svg",
                  "width": 264,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\text{模型二：}mx+\\frac{n}{x-a}=",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b07-f-0005-p01.svg",
                  "width": 187,
                  "height": 45
                },
                {
                  "latex": "m(x-a)+\\frac{n}{x-a}+ma\\ge",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b07-f-0005-p02.svg",
                  "width": 207,
                  "height": 45
                },
                {
                  "latex": "2\\sqrt{mn}+ma(m>0,n>0,x>a),",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b07-f-0005-p03.svg",
                  "width": 263,
                  "height": 32
                },
                {
                  "latex": "\\text{当且仅当 }x-a=\\sqrt{\\frac{n}{m}}\\text{ 时，等号成立}.",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b07-f-0005-p04.svg",
                  "width": 294,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\text{模型三：}\\frac{x}{ax^2+bx+c}=\\frac1{ax+b+\\frac{c}{x}}\\le",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b08-f-0006-p01.svg",
                  "width": 306,
                  "height": 53
                },
                {
                  "latex": "\\frac1{2\\sqrt{ac}+b}",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b08-f-0006-p02.svg",
                  "width": 83,
                  "height": 53
                },
                {
                  "latex": "(a>0,c>0,x>0,2\\sqrt{ac}+b\\ne0),",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b08-f-0006-p03.svg",
                  "width": 267,
                  "height": 32
                },
                {
                  "latex": "\\text{当且仅当 }x=\\sqrt{\\frac{c}{a}}\\text{ 时，等号成立}.",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b08-f-0006-p04.svg",
                  "width": 258,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\text{模型四：}x(n-mx)=\\frac{mx(n-mx)}{m}\\le",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b09-f-0007-p01.svg",
                  "width": 297,
                  "height": 49
                },
                {
                  "latex": "\\frac1m\\left[\\frac{mx+(n-mx)}2\\right]^2=",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b09-f-0007-p02.svg",
                  "width": 196,
                  "height": 57
                },
                {
                  "latex": "\\frac{n^2}{4m}(m>0,n>0,0<x<\\frac{n}{m}),",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b09-f-0007-p03.svg",
                  "width": 246,
                  "height": 50
                },
                {
                  "latex": "\\text{当且仅当 }x=\\frac{n}{2m}\\text{ 时，等号成立}.",
                  "asset": "/topic-package-a/assets/formulas/k01-s01-b09-f-0007-p04.svg",
                  "width": 255,
                  "height": 43
                }
              ]
            }
          ]
        },
        {
          "id": "K01-02",
          "title": "二、柯西不等式",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、柯西不等式"
            }
          ],
          "sourcePages": [
            3
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "二维形式的柯西不等式：若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b01-i01.svg",
                  "width": 64,
                  "height": 28,
                  "displayWidth": 111,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "都是实数，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b01-i02.svg",
                  "width": 235,
                  "height": 32,
                  "displayWidth": 405,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b01-i03.svg",
                  "width": 64,
                  "height": 26,
                  "displayWidth": 111,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "常用模型"
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "模型一：（1）“一高一低和式”配凑类型：已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b03-i01.svg",
                  "width": 62,
                  "height": 31,
                  "displayWidth": 107,
                  "displayHeight": 54
                },
                {
                  "type": "text",
                  "text": "的值，求"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b03-i02.svg",
                  "width": 47,
                  "height": 26,
                  "displayWidth": 81,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "的取值范围，或已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b03-i03.svg",
                  "width": 47,
                  "height": 26,
                  "displayWidth": 81,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "的值，求"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b03-i04.svg",
                  "width": 79,
                  "height": 31,
                  "displayWidth": 136,
                  "displayHeight": 54
                },
                {
                  "type": "text",
                  "text": "的最值或求"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b03-i05.svg",
                  "width": 76,
                  "height": 32,
                  "displayWidth": 131,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "的最值."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "例如，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b04-i01.svg",
                  "width": 205,
                  "height": 32,
                  "displayWidth": 353,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b04-i02.svg",
                  "width": 47,
                  "height": 26,
                  "displayWidth": 81,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（2）“同次积式”配凑类型：已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b05-i01.svg",
                  "width": 27,
                  "height": 23,
                  "displayWidth": 47,
                  "displayHeight": 40
                },
                {
                  "type": "text",
                  "text": "的值，求"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b05-i02.svg",
                  "width": 245,
                  "height": 29,
                  "displayWidth": 422,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "的最值."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "模型二："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b06-i01.svg",
                  "width": 261,
                  "height": 44,
                  "displayWidth": 449,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "，其中"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b06-i02.svg",
                  "width": 197,
                  "height": 28,
                  "displayWidth": 339,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b06-i03.svg",
                  "width": 88,
                  "height": 48,
                  "displayWidth": 152,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "例如，当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b07-i01.svg",
                  "width": 95,
                  "height": 28,
                  "displayWidth": 164,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "时，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b07-i02.svg",
                  "width": 357,
                  "height": 67,
                  "displayWidth": 615,
                  "displayHeight": 116
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b07-i03.svg",
                  "width": 47,
                  "height": 26,
                  "displayWidth": 81,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "模型三："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b08-i01-p01.svg",
                  "width": 111,
                  "height": 49,
                  "displayWidth": 191,
                  "displayHeight": 85
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b08-i01-p02.svg",
                  "width": 322,
                  "height": 53,
                  "displayWidth": 554,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "，其中"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b08-i02.svg",
                  "width": 174,
                  "height": 28,
                  "displayWidth": 300,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s02-b08-i03.svg",
                  "width": 146,
                  "height": 50,
                  "displayWidth": 252,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            }
          ]
        },
        {
          "id": "K01-03",
          "title": "三、权方和不等式",
          "titleSegments": [
            {
              "type": "text",
              "text": "三、权方和不等式"
            }
          ],
          "sourcePages": [
            4
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b01-i01.svg",
                  "width": 97,
                  "height": 28,
                  "displayWidth": 167,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b01-i02.svg",
                  "width": 163,
                  "height": 54,
                  "displayWidth": 281,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b01-i03.svg",
                  "width": 64,
                  "height": 51,
                  "displayWidth": 111,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "证明"
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "要证"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b03-i01.svg",
                  "width": 163,
                  "height": 54,
                  "displayWidth": 281,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "，即证"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b03-i02.svg",
                  "width": 174,
                  "height": 54,
                  "displayWidth": 300,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "因为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i01.svg",
                  "width": 97,
                  "height": 28,
                  "displayWidth": 167,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，即证"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i02.svg",
                  "width": 376,
                  "height": 31,
                  "displayWidth": 647,
                  "displayHeight": 54
                },
                {
                  "type": "text",
                  "text": "，故只需证"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i03.svg",
                  "width": 159,
                  "height": 31,
                  "displayWidth": 274,
                  "displayHeight": 54
                },
                {
                  "type": "text",
                  "text": "，即"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i04.svg",
                  "width": 115,
                  "height": 32,
                  "displayWidth": 198,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i05.svg",
                  "width": 95,
                  "height": 28,
                  "displayWidth": 164,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，即"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b04-i06.svg",
                  "width": 64,
                  "height": 51,
                  "displayWidth": 111,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "因此"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b05-i01.svg",
                  "width": 163,
                  "height": 54,
                  "displayWidth": 281,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b05-i02.svg",
                  "width": 64,
                  "height": 51,
                  "displayWidth": 111,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "推论1：若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b06-i01.svg",
                  "width": 220,
                  "height": 29,
                  "displayWidth": 379,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b06-i02.svg",
                  "width": 347,
                  "height": 54,
                  "displayWidth": 597,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b06-i03.svg",
                  "width": 123,
                  "height": 29,
                  "displayWidth": 212,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "推论2：若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b07-i01.svg",
                  "width": 274,
                  "height": 29,
                  "displayWidth": 472,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b07-i02.svg",
                  "width": 426,
                  "height": 57,
                  "displayWidth": 733,
                  "displayHeight": 99
                },
                {
                  "type": "text",
                  "text": "，当且仅当"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k01-s03-b07-i03.svg",
                  "width": 123,
                  "height": 29,
                  "displayWidth": 212,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "时，等号成立."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "K02",
      "order": 2,
      "packageRoot": "topic-package-a",
      "visualTheme": "",
      "layoutVariant": "",
      "title": "函数的奇偶性、周期性、图象的对称性",
      "sourcePages": [
        4,
        5
      ],
      "sections": [
        {
          "id": "K02-01",
          "title": "一、函数的奇偶性",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、函数的奇偶性"
            }
          ],
          "sourcePages": [
            4
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（1）常见的指对型奇函数："
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "y=a^x-a^{-x},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p01.svg",
                  "width": 109,
                  "height": 30
                },
                {
                  "latex": "y=\\frac{a^x-1}{a^x+1},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p02.svg",
                  "width": 98,
                  "height": 49
                },
                {
                  "latex": "y=\\frac{a^x+1}{a^x-1},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p03.svg",
                  "width": 98,
                  "height": 49
                },
                {
                  "latex": "y=\\ln\\frac{kx-b}{kx+b},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p04.svg",
                  "width": 115,
                  "height": 49
                },
                {
                  "latex": "y=\\ln\\frac{kx+b}{kx-b},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p05.svg",
                  "width": 115,
                  "height": 49
                },
                {
                  "latex": "y=\\log_a(x+\\sqrt{x^2+1}),",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p06.svg",
                  "width": 181,
                  "height": 36
                },
                {
                  "latex": "y=\\log_a(\\sqrt{x^2+1}-x).",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b02-f-0001-p07.svg",
                  "width": 181,
                  "height": 36
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（2）常见的指对型偶函数："
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "y=a^x+a^{-x},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b04-f-0002-p01.svg",
                  "width": 109,
                  "height": 30
                },
                {
                  "latex": "y=a^{|x|},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b04-f-0002-p02.svg",
                  "width": 68,
                  "height": 32
                },
                {
                  "latex": "y=a^{x^2},",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b04-f-0002-p03.svg",
                  "width": 67,
                  "height": 33
                },
                {
                  "latex": "y=\\log_a|x|,",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b04-f-0002-p04.svg",
                  "width": 96,
                  "height": 29
                },
                {
                  "latex": "y=\\left(\\frac12+\\frac1{2^x-1}\\right)x.",
                  "asset": "/topic-package-a/assets/formulas/k02-s01-b04-f-0002-p05.svg",
                  "width": 169,
                  "height": 53
                }
              ]
            }
          ]
        },
        {
          "id": "K02-02",
          "title": "二、函数的周期性",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、函数的周期性"
            }
          ],
          "sourcePages": [
            4,
            5
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k02-s02-b01-i01.svg",
                  "width": 72,
                  "height": 29,
                  "displayWidth": 124,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "对定义域内任意实数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k02-s02-b01-i02.svg",
                  "width": 18,
                  "height": 20,
                  "displayWidth": 31,
                  "displayHeight": 38
                },
                {
                  "type": "text",
                  "text": "（"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k02-s02-b01-i03.svg",
                  "width": 17,
                  "height": 20,
                  "displayWidth": 30,
                  "displayHeight": 38
                },
                {
                  "type": "text",
                  "text": "为常数，且"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k02-s02-b01-i04.svg",
                  "width": 49,
                  "height": 25,
                  "displayWidth": 85,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "）满足："
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k02-s02-b02-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "序号"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s02-b02-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "常见周期的表达式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s02-b02-h03",
                  "segments": [
                    {
                      "type": "formula",
                      "asset": "/topic-package-a/assets/formulas/k02-s02-b02-h03-i01.svg",
                      "width": 41,
                      "height": 29,
                      "displayWidth": 71,
                      "displayHeight": 50
                    },
                    {
                      "type": "text",
                      "text": "的周期"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k02-s02-b02-r01",
                  "cells": [
                    {
                      "uid": "k02-s02-b02-r01-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "①"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b02-r01-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r01-c02-i01.svg",
                          "width": 126,
                          "height": 29,
                          "displayWidth": 217,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b02-r01-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r01-c03-i01.svg",
                          "width": 52,
                          "height": 25,
                          "displayWidth": 90,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b02-r02",
                  "cells": [
                    {
                      "uid": "k02-s02-b02-r02-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "②"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b02-r02-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c02-i01-p01.svg",
                          "width": 143,
                          "height": 29,
                          "displayWidth": 246,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "\n"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c02-i01-p02.svg",
                          "width": 151,
                          "height": 52,
                          "displayWidth": 260,
                          "displayHeight": 90
                        },
                        {
                          "type": "text",
                          "text": "\n"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c02-i01-p03.svg",
                          "width": 160,
                          "height": 29,
                          "displayWidth": 276,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "\n"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c02-i01-p04.svg",
                          "width": 244,
                          "height": 54,
                          "displayWidth": 420,
                          "displayHeight": 93
                        },
                        {
                          "type": "text",
                          "text": "\n"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c02-i01-p05.svg",
                          "width": 252,
                          "height": 54,
                          "displayWidth": 434,
                          "displayHeight": 93
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b02-r02-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b02-r02-c03-i01.svg",
                          "width": 61,
                          "height": 25,
                          "displayWidth": 105,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "续表"
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k02-s02-b04-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "序号"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s02-b04-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "常见周期的表达式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s02-b04-h03",
                  "segments": [
                    {
                      "type": "formula",
                      "asset": "/topic-package-a/assets/formulas/k02-s02-b04-h03-i01.svg",
                      "width": 41,
                      "height": 29,
                      "displayWidth": 71,
                      "displayHeight": 50
                    },
                    {
                      "type": "text",
                      "text": "的周期"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k02-s02-b04-r01",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r01-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "③"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r01-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r01-c02-i01.svg",
                          "width": 206,
                          "height": 29,
                          "displayWidth": 355,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r01-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r01-c03-i01.svg",
                          "width": 90,
                          "height": 29,
                          "displayWidth": 155,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r02",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r02-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "④"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r02-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r02-c02-i01.svg",
                          "width": 219,
                          "height": 29,
                          "displayWidth": 377,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r02-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r02-c03-i01.svg",
                          "width": 98,
                          "height": 29,
                          "displayWidth": 169,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r03",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r03-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑤"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r03-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r03-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "的图象关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r03-c02-i02.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "和"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r03-c02-i03.svg",
                          "width": 48,
                          "height": 26,
                          "displayWidth": 83,
                          "displayHeight": 45
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r03-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r03-c03-i01.svg",
                          "width": 98,
                          "height": 29,
                          "displayWidth": 169,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r04",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r04-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑥"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r04-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r04-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "的图象关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r04-c02-i02.svg",
                          "width": 47,
                          "height": 29,
                          "displayWidth": 81,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "和点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r04-c02-i03.svg",
                          "width": 45,
                          "height": 29,
                          "displayWidth": 78,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r04-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r04-c03-i01.svg",
                          "width": 98,
                          "height": 29,
                          "displayWidth": 169,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r05",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r05-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑦"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r05-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r05-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "的图象关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r05-c02-i02.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称，又关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r05-c02-i03.svg",
                          "width": 45,
                          "height": 29,
                          "displayWidth": 78,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r05-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r05-c03-i01.svg",
                          "width": 98,
                          "height": 29,
                          "displayWidth": 169,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r06",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r06-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑧"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r06-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r06-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "是偶函数，其图象关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r06-c02-i02.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r06-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r06-c03-i01.svg",
                          "width": 61,
                          "height": 25,
                          "displayWidth": 105,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r07",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r07-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑨"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r07-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r07-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "是偶函数，其图象关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r07-c02-i02.svg",
                          "width": 47,
                          "height": 29,
                          "displayWidth": 81,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r07-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r07-c03-i01.svg",
                          "width": 61,
                          "height": 25,
                          "displayWidth": 105,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r08",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r08-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑩"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r08-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r08-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "是奇函数，其图象关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r08-c02-i02.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r08-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r08-c03-i01.svg",
                          "width": 61,
                          "height": 25,
                          "displayWidth": 105,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s02-b04-r09",
                  "cells": [
                    {
                      "uid": "k02-s02-b04-r09-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑪"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r09-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r09-c02-i01.svg",
                          "width": 41,
                          "height": 29,
                          "displayWidth": 71,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "是奇函数，其图象关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r09-c02-i02.svg",
                          "width": 47,
                          "height": 29,
                          "displayWidth": 81,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s02-b04-r09-c03",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s02-b04-r09-c03-i01.svg",
                          "width": 61,
                          "height": 25,
                          "displayWidth": 105,
                          "displayHeight": 43
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "K02-03",
          "title": "三、函数图象的对称性",
          "titleSegments": [
            {
              "type": "text",
              "text": "三、函数图象的对称性"
            }
          ],
          "sourcePages": [
            5
          ],
          "blocks": [
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "函数图象本身的对称性（自身对称）"
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k02-s03-b02-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "序号"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s03-b02-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "常见对称性的表达式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s03-b02-h03",
                  "segments": [
                    {
                      "type": "text",
                      "text": "图象关于线（点）对称"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k02-s03-b02-r01",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r01-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "①"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r01-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r01-c02-i01.svg",
                          "width": 154,
                          "height": 29,
                          "displayWidth": 265,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r01-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r01-c03-i01.svg",
                          "width": 85,
                          "height": 47,
                          "displayWidth": 147,
                          "displayHeight": 81
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r02",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r02-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论1"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r02-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r02-c02-i01.svg",
                          "width": 155,
                          "height": 29,
                          "displayWidth": 267,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r02-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r02-c03-i01.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r03",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r03-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论2"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r03-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r03-c02-i01.svg",
                          "width": 134,
                          "height": 29,
                          "displayWidth": 231,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r03-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r03-c03-i01.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r04",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r04-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论3"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r04-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r04-c02-i01.svg",
                          "width": 147,
                          "height": 29,
                          "displayWidth": 253,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r04-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r04-c03-i01.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r05",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r05-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "②"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r05-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r05-c02-i01.svg",
                          "width": 190,
                          "height": 29,
                          "displayWidth": 327,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r05-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r05-c03-i01.svg",
                          "width": 93,
                          "height": 53,
                          "displayWidth": 160,
                          "displayHeight": 92
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r06",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r06-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论1"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r06-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r06-c02-i01.svg",
                          "width": 192,
                          "height": 29,
                          "displayWidth": 331,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r06-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r06-c03-i01.svg",
                          "width": 46,
                          "height": 29,
                          "displayWidth": 80,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r07",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r07-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论2"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r07-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r07-c02-i01.svg",
                          "width": 171,
                          "height": 29,
                          "displayWidth": 295,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r07-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r07-c03-i01.svg",
                          "width": 46,
                          "height": 29,
                          "displayWidth": 80,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b02-r08",
                  "cells": [
                    {
                      "uid": "k02-s03-b02-r08-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论3"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r08-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r08-c02-i01.svg",
                          "width": 184,
                          "height": 29,
                          "displayWidth": 317,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b02-r08-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于点"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b02-r08-c03-i01.svg",
                          "width": 46,
                          "height": 29,
                          "displayWidth": 80,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "两个函数图象的对称性（相互对称）"
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k02-s03-b04-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "序号"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s03-b04-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "常见对称性的表达式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k02-s03-b04-h03",
                  "segments": [
                    {
                      "type": "text",
                      "text": "图象关于线（点）对称"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k02-s03-b04-r01",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r01-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "①"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r01-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r01-c02-i01.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r01-c02-i02.svg",
                          "width": 85,
                          "height": 29,
                          "displayWidth": 147,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r01-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r01-c03-i01.svg",
                          "width": 17,
                          "height": 23,
                          "displayWidth": 30,
                          "displayHeight": 40
                        },
                        {
                          "type": "text",
                          "text": "轴对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r02",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r02-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "②"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r02-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r02-c02-i01.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r02-c02-i02.svg",
                          "width": 85,
                          "height": 29,
                          "displayWidth": 147,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r02-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r02-c03-i01.svg",
                          "width": 18,
                          "height": 20,
                          "displayWidth": 31,
                          "displayHeight": 38
                        },
                        {
                          "type": "text",
                          "text": "轴对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r03",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r03-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "③"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r03-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r03-c02-i01.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r03-c02-i02.svg",
                          "width": 98,
                          "height": 29,
                          "displayWidth": 169,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r03-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于原点对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r04",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r04-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "④"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r04-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r04-c02-i01.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与其反函数"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r04-c02-i02.svg",
                          "width": 89,
                          "height": 32,
                          "displayWidth": 154,
                          "displayHeight": 56
                        },
                        {
                          "type": "text",
                          "text": "或"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r04-c02-i03.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r04-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r04-c03-i01.svg",
                          "width": 49,
                          "height": 26,
                          "displayWidth": 85,
                          "displayHeight": 45
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r05",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r05-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "⑤"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r05-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r05-c02-i01.svg",
                          "width": 102,
                          "height": 29,
                          "displayWidth": 176,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r05-c02-i02.svg",
                          "width": 100,
                          "height": 29,
                          "displayWidth": 172,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r05-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r05-c03-i01.svg",
                          "width": 85,
                          "height": 47,
                          "displayWidth": 147,
                          "displayHeight": 81
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r06",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r06-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论1"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r06-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r06-c02-i01.svg",
                          "width": 102,
                          "height": 29,
                          "displayWidth": 176,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r06-c02-i02.svg",
                          "width": 102,
                          "height": 29,
                          "displayWidth": 176,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r06-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r06-c03-i01.svg",
                          "width": 49,
                          "height": 25,
                          "displayWidth": 85,
                          "displayHeight": 43
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r07",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r07-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论2"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r07-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r07-c02-i01.svg",
                          "width": 72,
                          "height": 29,
                          "displayWidth": 124,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r07-c02-i02.svg",
                          "width": 110,
                          "height": 29,
                          "displayWidth": 190,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r07-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r07-c03-i01.svg",
                          "width": 50,
                          "height": 24,
                          "displayWidth": 86,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                },
                {
                  "uid": "k02-s03-b04-r08",
                  "cells": [
                    {
                      "uid": "k02-s03-b04-r08-c01",
                      "segments": [
                        {
                          "type": "text",
                          "text": "推论3"
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r08-c02",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r08-c02-i01.svg",
                          "width": 85,
                          "height": 29,
                          "displayWidth": 147,
                          "displayHeight": 50
                        },
                        {
                          "type": "text",
                          "text": "与"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r08-c02-i02.svg",
                          "width": 110,
                          "height": 29,
                          "displayWidth": 190,
                          "displayHeight": 50
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k02-s03-b04-r08-c03",
                      "segments": [
                        {
                          "type": "text",
                          "text": "关于直线"
                        },
                        {
                          "type": "formula",
                          "asset": "/topic-package-a/assets/formulas/k02-s03-b04-r08-c03-i01.svg",
                          "width": 63,
                          "height": 24,
                          "displayWidth": 109,
                          "displayHeight": 42
                        },
                        {
                          "type": "text",
                          "text": "对称"
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "K03",
      "order": 3,
      "packageRoot": "topic-package-a",
      "visualTheme": "",
      "layoutVariant": "",
      "title": "抽象函数问题",
      "sourcePages": [
        6
      ],
      "sections": [
        {
          "id": "K03-01",
          "title": "一、赋值法在抽象函数中的应用",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、赋值法在抽象函数中的应用"
            }
          ],
          "sourcePages": [
            6
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "赋值法是求解抽象函数问题最基本的方法，赋值时一般将"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b01-i01.svg",
                  "width": 76,
                  "height": 27,
                  "displayWidth": 131,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "等特殊值代入，结合给定的抽象函数的单调性、奇偶性、周期性、图象的对称性等性质进行求解."
                }
              ]
            },
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "点拨"
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "判断抽象函数单调性的方法"
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（1）凑：凑定义或凑已知，利用定义或已知条件得出结论."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（2）赋值：给变量赋值要根据条件与结论的关系.有时可能要进行多次尝试."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "①若给出的是“和型”抽象函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b06-i01.svg",
                  "width": 113,
                  "height": 29,
                  "displayWidth": 195,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，比较大小时要变形为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b06-i02.svg",
                  "width": 321,
                  "height": 29,
                  "displayWidth": 553,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b06-i03.svg",
                  "width": 321,
                  "height": 29,
                  "displayWidth": 553,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "；"
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "②若给出的是“积型”抽象函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b07-i01.svg",
                  "width": 92,
                  "height": 29,
                  "displayWidth": 159,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，比较大小时要变形为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b07-i02.svg",
                  "width": 283,
                  "height": 53,
                  "displayWidth": 487,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s01-b07-i03.svg",
                  "width": 283,
                  "height": 53,
                  "displayWidth": 487,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            }
          ]
        },
        {
          "id": "K03-02",
          "title": "二、常见的抽象函数模型",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、常见的抽象函数模型"
            }
          ],
          "sourcePages": [
            6
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（1）一次函数："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b01-i01.svg",
                  "width": 163,
                  "height": 29,
                  "displayWidth": 281,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，其对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b01-i02.svg",
                  "width": 205,
                  "height": 29,
                  "displayWidth": 353,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（2）二次函数："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b02-i01.svg",
                  "width": 209,
                  "height": 32,
                  "displayWidth": 360,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "，其对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b02-i02.svg",
                  "width": 261,
                  "height": 29,
                  "displayWidth": 449,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（3）幂函数："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b03-i01.svg",
                  "width": 82,
                  "height": 29,
                  "displayWidth": 142,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，其对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b03-i02.svg",
                  "width": 135,
                  "height": 29,
                  "displayWidth": 233,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b03-i03.svg",
                  "width": 125,
                  "height": 54,
                  "displayWidth": 215,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（4）指数函数："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b04-i01.svg",
                  "width": 182,
                  "height": 29,
                  "displayWidth": 314,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，其对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b04-i02.svg",
                  "width": 156,
                  "height": 29,
                  "displayWidth": 269,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b04-i03.svg",
                  "width": 132,
                  "height": 54,
                  "displayWidth": 228,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（5）对数函数："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b05-i01.svg",
                  "width": 207,
                  "height": 29,
                  "displayWidth": 357,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，其对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b05-i02.svg",
                  "width": 156,
                  "height": 29,
                  "displayWidth": 269,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b05-i03.svg",
                  "width": 170,
                  "height": 53,
                  "displayWidth": 293,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b05-i04.svg",
                  "width": 115,
                  "height": 29,
                  "displayWidth": 198,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "（6）三角函数：①正弦函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b06-i01.svg",
                  "width": 97,
                  "height": 29,
                  "displayWidth": 167,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b06-i02.svg",
                  "width": 255,
                  "height": 32,
                  "displayWidth": 439,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "note",
              "segments": [
                {
                  "type": "text",
                  "text": "【提示】对应正弦的平方差公式："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b07-i01.svg",
                  "width": 288,
                  "height": 32,
                  "displayWidth": 496,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "②余弦函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b08-i01.svg",
                  "width": 99,
                  "height": 29,
                  "displayWidth": 171,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b08-i02.svg",
                  "width": 291,
                  "height": 53,
                  "displayWidth": 501,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "或"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b08-i03.svg",
                  "width": 263,
                  "height": 47,
                  "displayWidth": 453,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "note",
              "segments": [
                {
                  "type": "text",
                  "text": "【提示】分别对应余弦的和差化积公式："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b09-i01.svg",
                  "width": 284,
                  "height": 48,
                  "displayWidth": 489,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "；"
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\text{余弦的积化和差公式：}\\cos\\alpha\\cos\\beta=",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b10-f-0029-p01.svg",
                  "width": 274,
                  "height": 29
                },
                {
                  "latex": "\\frac{\\cos(\\alpha+\\beta)+\\cos(\\alpha-\\beta)}2.",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b10-f-0029-p02.svg",
                  "width": 196,
                  "height": 49
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "③正切函数"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b11-i01.svg",
                  "width": 262,
                  "height": 44,
                  "displayWidth": 451,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "，对应的抽象函数为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b11-i02.svg",
                  "width": 193,
                  "height": 54,
                  "displayWidth": 332,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "note",
              "segments": [
                {
                  "type": "text",
                  "text": "【提示】对应正切函数的和差角公式："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-a/assets/formulas/k03-s02-b12-i01.svg",
                  "width": 225,
                  "height": 51,
                  "displayWidth": 387,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
