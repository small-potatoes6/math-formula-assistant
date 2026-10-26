module.exports = {
  "modules": [
    {
      "id": "K07",
      "order": 7,
      "packageRoot": "topic-package-c",
      "visualTheme": "",
      "layoutVariant": "",
      "title": "三角形面积问题",
      "sourcePages": [
        11
      ],
      "sections": [
        {
          "id": "K07-01",
          "title": "一、三角形面积公式",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、三角形面积公式"
            }
          ],
          "sourcePages": [
            11
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b01-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b01-i02.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "所对的边的长分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b01-i03.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b01-i04.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的面积可以表示为："
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(1)S_{\\triangle ABC}=\\frac12ab\\sin C=\\frac12bc\\sin A=",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b02-f-0005-p01.svg",
                  "width": 285,
                  "height": 47
                },
                {
                  "latex": "\\frac12ac\\sin B;",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b02-f-0005-p02.svg",
                  "width": 85,
                  "height": 47
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(2)S_{\\triangle ABC}=\\frac12a\\cdot h_a=\\frac12b\\cdot h_b=\\frac12c\\cdot",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b03-f-0006-p01.svg",
                  "width": 283,
                  "height": 47
                },
                {
                  "latex": "h_c\\ (h_a,h_b,h_c\\text{ 分别表示边 }a,b,c\\text{ 上的高});",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b03-f-0006-p02.svg",
                  "width": 300,
                  "height": 29
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(3)S_{\\triangle ABC}=\\frac12r(a+b+c)=\\frac12rl,",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b04-f-0007-p01.svg",
                  "width": 261,
                  "height": 47
                },
                {
                  "latex": "\\text{其中 }r,",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b04-f-0007-p02.svg",
                  "width": 59,
                  "height": 29
                },
                {
                  "latex": "l\\text{ 分别为 }\\triangle ABC\\text{ 的内切圆半径及 }",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b04-f-0007-p03.svg",
                  "width": 254,
                  "height": 29
                },
                {
                  "latex": "\\triangle ABC\\text{ 的周长};",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b04-f-0007-p04.svg",
                  "width": 122,
                  "height": 29
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(4)S_{\\triangle ABC}=\\frac12a^2\\frac{\\sin B\\sin C}{\\sin A},",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b05-f-0008-p01.svg",
                  "width": 223,
                  "height": 48
                },
                {
                  "latex": "S_{\\triangle ABC}=\\frac12b^2\\frac{\\sin A\\sin C}{\\sin B},",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b05-f-0008-p02.svg",
                  "width": 200,
                  "height": 48
                },
                {
                  "latex": "S_{\\triangle ABC}=\\frac12c^2\\frac{\\sin A\\sin B}{\\sin C};",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b05-f-0008-p03.svg",
                  "width": 200,
                  "height": 48
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(5)S_{\\triangle ABC}=2R^2\\sin A\\sin B\\sin C=",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b06-f-0009-p01.svg",
                  "width": 268,
                  "height": 32
                },
                {
                  "latex": "\\frac{abc}{4R}(R\\text{ 为 }\\triangle ABC\\text{ 外接圆的半径});",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b06-f-0009-p02.svg",
                  "width": 256,
                  "height": 48
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(6)\\text{海伦公式：}S_{\\triangle ABC}=",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b07-f-0010-p01.svg",
                  "width": 183,
                  "height": 29
                },
                {
                  "latex": "\\sqrt{p(p-a)(p-b)(p-c)},",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b07-f-0010-p02.svg",
                  "width": 190,
                  "height": 44
                },
                {
                  "latex": "\\text{其中 }p=\\frac12(a+b+c);",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b07-f-0010-p03.svg",
                  "width": 177,
                  "height": 47
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
                  "text": "由余弦定理得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i01.svg",
                  "width": 165,
                  "height": 50,
                  "displayWidth": 284,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "，所以"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i02-p01.svg",
                  "width": 76,
                  "height": 27,
                  "displayWidth": 131,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i02-p02.svg",
                  "width": 98,
                  "height": 47,
                  "displayWidth": 169,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i02-p03.svg",
                  "width": 151,
                  "height": 47,
                  "displayWidth": 260,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i02-p04.svg",
                  "width": 215,
                  "height": 65,
                  "displayWidth": 370,
                  "displayHeight": 112
                },
                {
                  "type": "text",
                  "text": ". 令"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i03.svg",
                  "width": 134,
                  "height": 47,
                  "displayWidth": 231,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "，整理得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b09-i04.svg",
                  "width": 258,
                  "height": 44,
                  "displayWidth": 444,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(7)S_{\\triangle ABC}=\\frac12\\sqrt{|\\boldsymbol a|^2|\\boldsymbol b|^2-(\\boldsymbol a\\cdot\\boldsymbol b)^2},",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b10-f-0018-p01.svg",
                  "width": 267,
                  "height": 47
                },
                {
                  "latex": "\\text{其中 }\\boldsymbol b=\\overrightarrow{CA},",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b10-f-0018-p02.svg",
                  "width": 109,
                  "height": 43
                },
                {
                  "latex": "\\boldsymbol a=\\overrightarrow{CB};",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b10-f-0018-p03.svg",
                  "width": 72,
                  "height": 43
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(8)S_{\\triangle ABC}=\\frac12|a_1b_2-a_2b_1|,",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b11-f-0019-p01.svg",
                  "width": 216,
                  "height": 47
                },
                {
                  "latex": "\\text{其中 }\\overrightarrow{AB}=(a_1,a_2),",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b11-f-0019-p02.svg",
                  "width": 153,
                  "height": 44
                },
                {
                  "latex": "\\overrightarrow{AC}=(b_1,b_2).",
                  "asset": "/topic-package-c/assets/formulas/k07-s01-b11-f-0019-p03.svg",
                  "width": 112,
                  "height": 44
                }
              ]
            },
            {
              "type": "note",
              "segments": [
                {
                  "type": "text",
                  "text": "【说明】公式(7)可视为三角形面积公式的向量形式，公式(8)则是三角形面积公式的向量坐标形式."
                }
              ]
            }
          ]
        },
        {
          "id": "K07-02",
          "title": "二、三角形面积比的处理方法",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、三角形面积比的处理方法"
            }
          ],
          "sourcePages": [
            11
          ],
          "blocks": [
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "对顶角模型"
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k07-s02-b02-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "公式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k07-s02-b02-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "图示"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k07-s02-b02-r01",
                  "cells": [
                    {
                      "uid": "k07-s02-b02-r01-c01",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-c/assets/formulas/k07-s02-b02-r01-c01-i01.svg",
                          "width": 323,
                          "height": 61,
                          "displayWidth": 556,
                          "displayHeight": 105
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k07-s02-b02-r01-c02",
                      "segments": [
                        {
                          "type": "figure",
                          "asset": "/topic-package-c/assets/figures/k07-fig-s02-b02-r01-c02.svg",
                          "width": 765,
                          "height": 600
                        }
                      ],
                      "colspan": 1
                    }
                  ]
                }
              ]
            },
            {
              "type": "label",
              "segments": [
                {
                  "type": "text",
                  "text": "等角、共角模型"
                }
              ]
            },
            {
              "type": "table",
              "columns": [
                {
                  "uid": "k07-s02-b04-h01",
                  "segments": [
                    {
                      "type": "text",
                      "text": "公式"
                    }
                  ],
                  "colspan": 1
                },
                {
                  "uid": "k07-s02-b04-h02",
                  "segments": [
                    {
                      "type": "text",
                      "text": "图示"
                    }
                  ],
                  "colspan": 1
                }
              ],
              "rows": [
                {
                  "uid": "k07-s02-b04-r01",
                  "cells": [
                    {
                      "uid": "k07-s02-b04-r01-c01",
                      "segments": [
                        {
                          "type": "formula",
                          "asset": "/topic-package-c/assets/formulas/k07-s02-b04-r01-c01-i01.svg",
                          "width": 323,
                          "height": 61,
                          "displayWidth": 556,
                          "displayHeight": 105
                        }
                      ],
                      "colspan": 1
                    },
                    {
                      "uid": "k07-s02-b04-r01-c02",
                      "segments": [
                        {
                          "type": "figure",
                          "asset": "/topic-package-c/assets/figures/k07-fig-s02-b04-r01-c02.svg",
                          "width": 765,
                          "height": 675
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
      "id": "K08",
      "order": 8,
      "packageRoot": "topic-package-c",
      "visualTheme": "",
      "layoutVariant": "",
      "title": "射影定理、三角形的“三线”、张角定理",
      "sourcePages": [
        12,
        13
      ],
      "sections": [
        {
          "id": "K08-01",
          "title": "一、射影定理",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、射影定理"
            }
          ],
          "sourcePages": [
            12
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)直角三角形中的射影定理：如图，在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b01-i01.svg",
                  "width": 81,
                  "height": 25,
                  "displayWidth": 140,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b01-i02.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为直角，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b01-i03.svg",
                  "width": 84,
                  "height": 25,
                  "displayWidth": 145,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "于点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b01-i04.svg",
                  "width": 23,
                  "height": 24,
                  "displayWidth": 40,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "，则有"
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k08-fig-s01-b02.svg",
              "width": 585,
              "height": 390
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(1)AC^2=AD\\cdot AB;",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b03-f-0005-p01.svg",
                  "width": 156,
                  "height": 32
                },
                {
                  "latex": "(2)BC^2=BD\\cdot AB;",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b03-f-0005-p02.svg",
                  "width": 157,
                  "height": 32
                },
                {
                  "latex": "(3)CD^2=AD\\cdot DB.",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b03-f-0005-p03.svg",
                  "width": 158,
                  "height": 32
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(2)任意三角形中的射影定理：在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b04-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b04-i02.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "对应的边分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b04-i03.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，则有"
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(1)a=b\\cos C+c\\cos B;",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b05-f-0009-p01.svg",
                  "width": 185,
                  "height": 29
                },
                {
                  "latex": "(2)b=c\\cos A+a\\cos C;",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b05-f-0009-p02.svg",
                  "width": 185,
                  "height": 29
                },
                {
                  "latex": "(3)c=a\\cos B+b\\cos A.",
                  "asset": "/topic-package-c/assets/formulas/k08-s01-b05-f-0009-p03.svg",
                  "width": 185,
                  "height": 29
                }
              ]
            }
          ]
        },
        {
          "id": "K08-02",
          "title": "二、三角形的“三线”",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、三角形的“三线”"
            }
          ],
          "sourcePages": [
            12,
            13
          ],
          "blocks": [
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "1.三角形的中线："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b02-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b02-i02.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "的对边分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b02-i03.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b02-i04.svg",
                  "width": 89,
                  "height": 23,
                  "displayWidth": 154,
                  "displayHeight": 40
                },
                {
                  "type": "text",
                  "text": "分别为边"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b02-i05.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "上的中线，则"
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "m_a=\\frac12\\sqrt{2(b^2+c^2)-a^2},",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b03-f-0015-p01.svg",
                  "width": 201,
                  "height": 47
                },
                {
                  "latex": "m_b=\\frac12\\sqrt{2(c^2+a^2)-b^2},",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b03-f-0015-p02.svg",
                  "width": 200,
                  "height": 47
                },
                {
                  "latex": "m_c=\\frac12\\sqrt{2(a^2+b^2)-c^2}.",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b03-f-0015-p03.svg",
                  "width": 200,
                  "height": 47
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(2)在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i02.svg",
                  "width": 35,
                  "height": 25,
                  "displayWidth": 61,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i03.svg",
                  "width": 34,
                  "height": 25,
                  "displayWidth": 59,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "边上的中线，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i04-p01.svg",
                  "width": 114,
                  "height": 29,
                  "displayWidth": 197,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i04-p02.svg",
                  "width": 138,
                  "height": 32,
                  "displayWidth": 238,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b04-i04-p03.svg",
                  "width": 120,
                  "height": 32,
                  "displayWidth": 207,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "."
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
                  "text": "在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i01.svg",
                  "width": 63,
                  "height": 25,
                  "displayWidth": 109,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i02.svg",
                  "width": 220,
                  "height": 50,
                  "displayWidth": 379,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "，在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i03.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i04.svg",
                  "width": 220,
                  "height": 50,
                  "displayWidth": 379,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "，联立两个方程可得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i05.svg",
                  "width": 230,
                  "height": 32,
                  "displayWidth": 396,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": ".同理，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b06-i06.svg",
                  "width": 230,
                  "height": 32,
                  "displayWidth": 396,
                  "displayHeight": 56
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k08-fig-s02-b07.svg",
              "width": 570,
              "height": 495
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(3)向量法："
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b08-i01.svg",
                  "width": 268,
                  "height": 54,
                  "displayWidth": 461,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
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
                  "text": "由"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b10-i01.svg",
                  "width": 159,
                  "height": 51,
                  "displayWidth": 274,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "，得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b10-i02-p01.svg",
                  "width": 61,
                  "height": 44,
                  "displayWidth": 105,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b10-i02-p02.svg",
                  "width": 135,
                  "height": 51,
                  "displayWidth": 233,
                  "displayHeight": 88
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b10-i02-p03.svg",
                  "width": 303,
                  "height": 54,
                  "displayWidth": 522,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "，所以"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b10-i03.svg",
                  "width": 268,
                  "height": 54,
                  "displayWidth": 461,
                  "displayHeight": 93
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "2.三角形的高线："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i02.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "所对的边分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i03.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i04.svg",
                  "width": 75,
                  "height": 28,
                  "displayWidth": 129,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "分别为边"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i05.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "上的高，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i06-p01.svg",
                  "width": 106,
                  "height": 27,
                  "displayWidth": 183,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i06-p02.svg",
                  "width": 103,
                  "height": 47,
                  "displayWidth": 178,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b12-i06-p03.svg",
                  "width": 169,
                  "height": 47,
                  "displayWidth": 291,
                  "displayHeight": 81
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
                  "text": "(2)求高一般采用等面积法，即求某边上的高，需要求出面积和底边长度."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "3.三角形的内角平分线："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)角平分线性质定理：如图，在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i02.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "对应的边分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i03.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i04.svg",
                  "width": 35,
                  "height": 25,
                  "displayWidth": 61,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i05.svg",
                  "width": 59,
                  "height": 25,
                  "displayWidth": 102,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的平分线，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b15-i06.svg",
                  "width": 99,
                  "height": 48,
                  "displayWidth": 171,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k08-fig-s02-b16.svg",
              "width": 570,
              "height": 570
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "(2)\\text{角平分线长公式：}AD=\\frac{2bc\\cos\\frac A2}{b+c}.",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b17-f-0048.svg",
                  "width": 296,
                  "height": 55
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
                  "text": "因为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b19-i01.svg",
                  "width": 203,
                  "height": 27,
                  "displayWidth": 350,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "，所以"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b19-i02.svg",
                  "width": 340,
                  "height": 48,
                  "displayWidth": 585,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "，所以"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b19-i03.svg",
                  "width": 178,
                  "height": 48,
                  "displayWidth": 307,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "，整理得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s02-b19-i04.svg",
                  "width": 134,
                  "height": 55,
                  "displayWidth": 231,
                  "displayHeight": 95
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
          "id": "K08-03",
          "title": "三、张角定理",
          "titleSegments": [
            {
              "type": "text",
              "text": "三、张角定理"
            }
          ],
          "sourcePages": [
            13
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "如图所示，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i01.svg",
                  "width": 23,
                  "height": 24,
                  "displayWidth": 40,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "为边"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i02.svg",
                  "width": 34,
                  "height": 25,
                  "displayWidth": 59,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "上一点，设"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i03.svg",
                  "width": 94,
                  "height": 26,
                  "displayWidth": 162,
                  "displayHeight": 45
                },
                {
                  "type": "text",
                  "text": "，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i04.svg",
                  "width": 93,
                  "height": 28,
                  "displayWidth": 160,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i05.svg",
                  "width": 218,
                  "height": 49,
                  "displayWidth": 375,
                  "displayHeight": 85
                },
                {
                  "type": "text",
                  "text": ".特别地，若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i06.svg",
                  "width": 35,
                  "height": 25,
                  "displayWidth": 61,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "恰好为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i07.svg",
                  "width": 59,
                  "height": 25,
                  "displayWidth": 102,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的平分线，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b01-i08.svg",
                  "width": 198,
                  "height": 53,
                  "displayWidth": 341,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k08-fig-s03-b02.svg",
              "width": 735,
              "height": 600
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
                  "text": "因为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i01.svg",
                  "width": 203,
                  "height": 27,
                  "displayWidth": 350,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "，由三角形面积公式可得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i02-p01.svg",
                  "width": 193,
                  "height": 47,
                  "displayWidth": 332,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i02-p02.svg",
                  "width": 283,
                  "height": 47,
                  "displayWidth": 487,
                  "displayHeight": 81
                },
                {
                  "type": "text",
                  "text": "，两边同除以"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i03.svg",
                  "width": 111,
                  "height": 25,
                  "displayWidth": 191,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "，得"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i04.svg",
                  "width": 217,
                  "height": 48,
                  "displayWidth": 374,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "，即"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k08-s03-b04-i05.svg",
                  "width": 218,
                  "height": 49,
                  "displayWidth": 375,
                  "displayHeight": 85
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
    },
    {
      "id": "K09",
      "order": 9,
      "packageRoot": "topic-package-c",
      "visualTheme": "",
      "layoutVariant": "",
      "title": "奔驰定理与三角形的“四心”",
      "sourcePages": [
        13,
        14
      ],
      "sections": [
        {
          "id": "K09-01",
          "title": "一、奔驰定理",
          "titleSegments": [
            {
              "type": "text",
              "text": "一、奔驰定理"
            }
          ],
          "sourcePages": [
            13
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "如图，已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b01-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b01-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内一点，则有"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b01-i03.svg",
                  "width": 346,
                  "height": 42,
                  "displayWidth": 596,
                  "displayHeight": 73
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k09-fig-s01-b02.svg",
              "width": 900,
              "height": 600
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
                  "text": "如图，延长"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i01.svg",
                  "width": 34,
                  "height": 25,
                  "displayWidth": 59,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "与"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i02.svg",
                  "width": 34,
                  "height": 25,
                  "displayWidth": 59,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "边相交于点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i03.svg",
                  "width": 23,
                  "height": 24,
                  "displayWidth": 40,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i04-p01.svg",
                  "width": 61,
                  "height": 48,
                  "displayWidth": 105,
                  "displayHeight": 83
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i04-p02.svg",
                  "width": 85,
                  "height": 50,
                  "displayWidth": 147,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i04-p03.svg",
                  "width": 85,
                  "height": 50,
                  "displayWidth": 147,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i04-p04.svg",
                  "width": 156,
                  "height": 50,
                  "displayWidth": 269,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b04-i04-p05.svg",
                  "width": 66,
                  "height": 50,
                  "displayWidth": 114,
                  "displayHeight": 86
                },
                {
                  "type": "text",
                  "text": "，"
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\overrightarrow{OD}=\\frac{DC}{BC}\\overrightarrow{OB}+\\frac{BD}{BC}\\overrightarrow{OC}=",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b05-f-0012-p01.svg",
                  "width": 218,
                  "height": 51
                },
                {
                  "latex": "\\frac{S_{\\triangle AOC}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OB}+",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b05-f-0012-p02.svg",
                  "width": 176,
                  "height": 54
                },
                {
                  "latex": "\\frac{S_{\\triangle AOB}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OC}.",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b05-f-0012-p03.svg",
                  "width": 167,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\frac{OD}{OA}=\\frac{S_{\\triangle BOD}}{S_{\\triangle AOB}}=\\frac{S_{\\triangle COD}}{S_{\\triangle AOC}}=",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b06-f-0013-p01.svg",
                  "width": 223,
                  "height": 50
                },
                {
                  "latex": "\\frac{S_{\\triangle BOD}+S_{\\triangle COD}}{S_{\\triangle AOB}+S_{\\triangle AOC}}=\\frac{S_{\\triangle BOC}}{S_{\\triangle AOC}+S_{\\triangle AOB}},",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b06-f-0013-p02.svg",
                  "width": 294,
                  "height": 50
                },
                {
                  "latex": "\\therefore\\overrightarrow{OD}=-\\frac{S_{\\triangle BOC}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OA},",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b06-f-0013-p03.svg",
                  "width": 246,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\therefore-\\frac{S_{\\triangle BOC}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OA}=",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b07-f-0014-p01.svg",
                  "width": 209,
                  "height": 54
                },
                {
                  "latex": "\\frac{S_{\\triangle AOC}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OB}+",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b07-f-0014-p02.svg",
                  "width": 176,
                  "height": 54
                },
                {
                  "latex": "\\frac{S_{\\triangle AOB}}{S_{\\triangle AOC}+S_{\\triangle AOB}}\\overrightarrow{OC},",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b07-f-0014-p03.svg",
                  "width": 167,
                  "height": 54
                }
              ]
            },
            {
              "type": "formula",
              "parts": [
                {
                  "latex": "\\therefore S_{\\triangle BOC}\\cdot\\overrightarrow{OA}+S_{\\triangle AOC}\\cdot\\overrightarrow{OB}+S_{\\triangle AOB}\\cdot",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b08-f-0015-p01.svg",
                  "width": 297,
                  "height": 42
                },
                {
                  "latex": "\\overrightarrow{OC}=\\boldsymbol0.",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b08-f-0015-p02.svg",
                  "width": 72,
                  "height": 41
                }
              ]
            },
            {
              "type": "figure",
              "asset": "/topic-package-c/assets/figures/k09-fig-s01-b09.svg",
              "width": 870,
              "height": 750
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "推论：若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b10-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b10-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内的一点，且"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b10-i03.svg",
                  "width": 293,
                  "height": 44,
                  "displayWidth": 504,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s01-b10-i04.svg",
                  "width": 263,
                  "height": 28,
                  "displayWidth": 453,
                  "displayHeight": 49
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
          "id": "K09-02",
          "title": "二、三角形的“四心”",
          "titleSegments": [
            {
              "type": "text",
              "text": "二、三角形的“四心”"
            }
          ],
          "sourcePages": [
            14
          ],
          "blocks": [
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "三角形的“四心”即重心(三条中线的交点，重心将中线长度分成"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b01-i01.svg",
                  "width": 40,
                  "height": 24,
                  "displayWidth": 69,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": ")、内心(三条角平分线的交点，也是三角形内切圆的圆心)、外心(三条中垂线的交点，也是三角形外接圆的圆心)、垂心(三条高线的交点)."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "重心："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b03-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b03-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的重心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b03-i03.svg",
                  "width": 263,
                  "height": 27,
                  "displayWidth": 453,
                  "displayHeight": 47
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
                  "text": "(2)"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b04-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b04-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的重心"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b04-i03.svg",
                  "width": 182,
                  "height": 41,
                  "displayWidth": 314,
                  "displayHeight": 71
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
                  "text": "(3)设"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内一点，若动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i03.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "满足"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i04.svg",
                  "width": 296,
                  "height": 44,
                  "displayWidth": 510,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "，则动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i05.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "的轨迹一定通过"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b05-i06.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的重心."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(4)若动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b06-i01.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "满足"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b06-i02-p01.svg",
                  "width": 52,
                  "height": 41,
                  "displayWidth": 90,
                  "displayHeight": 71
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b06-i02-p02.svg",
                  "width": 380,
                  "height": 82,
                  "displayWidth": 654,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "，则动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b06-i03.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "的轨迹一定通过"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b06-i04.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的重心."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(5)已知"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b07-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的顶点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b07-i02.svg",
                  "width": 242,
                  "height": 29,
                  "displayWidth": 417,
                  "displayHeight": 50
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b07-i03.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的重心坐标为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b07-i04.svg",
                  "width": 256,
                  "height": 53,
                  "displayWidth": 441,
                  "displayHeight": 92
                },
                {
                  "type": "text",
                  "text": "."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "内心："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i03.svg",
                  "width": 261,
                  "height": 27,
                  "displayWidth": 449,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "(其中"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i04.svg",
                  "width": 47,
                  "height": 28,
                  "displayWidth": 81,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "分别为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i05.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内角"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b09-i06.svg",
                  "width": 62,
                  "height": 28,
                  "displayWidth": 107,
                  "displayHeight": 49
                },
                {
                  "type": "text",
                  "text": "的对边)."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(2)在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b10-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b10-i02.svg",
                  "width": 342,
                  "height": 44,
                  "displayWidth": 589,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b10-i03.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的内心."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(3)设"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内一点，若动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i03.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "满足"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i04.svg",
                  "width": 350,
                  "height": 82,
                  "displayWidth": 602,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "，则动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i05.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "的轨迹一定通过"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b11-i06.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的内心."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(4)在"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i01.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "中，"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i02-p01.svg",
                  "width": 200,
                  "height": 82,
                  "displayWidth": 344,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i02-p02.svg",
                  "width": 200,
                  "height": 82,
                  "displayWidth": 344,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i02-p03.svg",
                  "width": 201,
                  "height": 82,
                  "displayWidth": 346,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i02-p04.svg",
                  "width": 58,
                  "height": 25,
                  "displayWidth": 100,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b12-i03.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的内心."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "外心："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b14-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b14-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的外心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b14-i03-p01.svg",
                  "width": 204,
                  "height": 27,
                  "displayWidth": 351,
                  "displayHeight": 47
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b14-i03-p02.svg",
                  "width": 172,
                  "height": 25,
                  "displayWidth": 296,
                  "displayHeight": 43
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
                  "text": "(2)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b15-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b15-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的外心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b15-i03.svg",
                  "width": 154,
                  "height": 44,
                  "displayWidth": 265,
                  "displayHeight": 76
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
                  "text": "(3)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b16-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b16-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的外心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b16-i03.svg",
                  "width": 332,
                  "height": 41,
                  "displayWidth": 572,
                  "displayHeight": 71
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
                  "text": "(4)设"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内一点，若动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i03.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "满足"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i04-p01.svg",
                  "width": 52,
                  "height": 41,
                  "displayWidth": 90,
                  "displayHeight": 71
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i04-p02.svg",
                  "width": 438,
                  "height": 82,
                  "displayWidth": 754,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "，则动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i05.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "的轨迹一定通过"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b17-i06.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的外心."
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(5)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i01-p01.svg",
                  "width": 150,
                  "height": 44,
                  "displayWidth": 258,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i01-p02.svg",
                  "width": 150,
                  "height": 44,
                  "displayWidth": 258,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i01-p03.svg",
                  "width": 150,
                  "height": 44,
                  "displayWidth": 258,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i01-p04.svg",
                  "width": 18,
                  "height": 24,
                  "displayWidth": 31,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i02.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b18-i03.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的外心."
                }
              ]
            },
            {
              "type": "subheading",
              "segments": [
                {
                  "type": "text",
                  "text": "垂心："
                }
              ]
            },
            {
              "type": "paragraph",
              "segments": [
                {
                  "type": "text",
                  "text": "(1)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b20-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b20-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的垂心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b20-i03.svg",
                  "width": 358,
                  "height": 28,
                  "displayWidth": 616,
                  "displayHeight": 49
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
                  "text": "(2)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b21-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b21-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的垂心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b21-i03.svg",
                  "width": 246,
                  "height": 41,
                  "displayWidth": 424,
                  "displayHeight": 71
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
                  "text": "(3)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b22-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b22-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "(非直角三角形)的垂心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b22-i03.svg",
                  "width": 318,
                  "height": 41,
                  "displayWidth": 547,
                  "displayHeight": 71
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
                  "text": "(4)若"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b23-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "为"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b23-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的垂心，则"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b23-i03-p01.svg",
                  "width": 133,
                  "height": 44,
                  "displayWidth": 229,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b23-i03-p02.svg",
                  "width": 133,
                  "height": 44,
                  "displayWidth": 229,
                  "displayHeight": 76
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b23-i03-p03.svg",
                  "width": 115,
                  "height": 44,
                  "displayWidth": 198,
                  "displayHeight": 76
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
                  "text": "(5)设"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i01.svg",
                  "width": 21,
                  "height": 25,
                  "displayWidth": 37,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "是"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i02.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "内一点，若动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i03.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "满足"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i04-p01.svg",
                  "width": 52,
                  "height": 41,
                  "displayWidth": 90,
                  "displayHeight": 71
                },
                {
                  "type": "text",
                  "text": "\n"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i04-p02.svg",
                  "width": 384,
                  "height": 82,
                  "displayWidth": 661,
                  "displayHeight": 142
                },
                {
                  "type": "text",
                  "text": "，则动点"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i05.svg",
                  "width": 21,
                  "height": 24,
                  "displayWidth": 37,
                  "displayHeight": 42
                },
                {
                  "type": "text",
                  "text": "的轨迹一定通过"
                },
                {
                  "type": "formula",
                  "asset": "/topic-package-c/assets/formulas/k09-s02-b24-i06.svg",
                  "width": 62,
                  "height": 25,
                  "displayWidth": 107,
                  "displayHeight": 43
                },
                {
                  "type": "text",
                  "text": "的垂心."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
