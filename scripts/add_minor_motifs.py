#!/usr/bin/env python3
"""
为小阿尔卡那生成 motif 数据（基于 Rider-Waite-Smith 牌面元素）
每个 motif 包含 id, label, meaning, bbox (归一化坐标)
"""

import json
import os

# ─── 标准 RWS 小阿尔卡那视觉元素 ───

MINOR_MOTIFS = {
    # ═══ 权杖 Wands ═══
    "wands_ace": [
        {"id": "m1", "label": "从云中伸出的手", "meaning": "火元素的原初能量，创造力的觉醒", "bbox": {"x": 0.35, "y": 0.05, "w": 0.3, "h": 0.15}},
        {"id": "m2", "label": "权杖/树枝", "meaning": "行动的工具，生命力的象征", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.4}},
        {"id": "m3", "label": "嫩叶新芽", "meaning": "新的开始，成长的潜力", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.15}},
        {"id": "m4", "label": "远山与城堡", "meaning": "目标与愿景，未来的可能性", "bbox": {"x": 0.1, "y": 0.65, "w": 0.8, "h": 0.2}},
    ],
    "wands_2": [
        {"id": "m1", "label": "手持地球仪", "meaning": "掌控全局的视野与权力", "bbox": {"x": 0.35, "y": 0.25, "w": 0.3, "h": 0.2}},
        {"id": "m2", "label": "城墙上的权杖", "meaning": "已建立的基础与力量", "bbox": {"x": 0.1, "y": 0.15, "w": 0.25, "h": 0.5}},
        {"id": "m3", "label": "远方的海洋", "meaning": "未知的可能性与探索", "bbox": {"x": 0.5, "y": 0.5, "w": 0.4, "h": 0.3}},
    ],
    "wands_3": [
        {"id": "m1", "label": "三根权杖", "meaning": "扩展与展望，三重力量", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "等待的商人", "meaning": "耐心等待成果，商业远见", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.4}},
        {"id": "m3", "label": "远航的船只", "meaning": "贸易与进展，行动的成果", "bbox": {"x": 0.5, "y": 0.55, "w": 0.35, "h": 0.2}},
    ],
    "wands_4": [
        {"id": "m1", "label": "庆祝的人群", "meaning": "胜利与欢乐，社区的祝福", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.3}},
        {"id": "m2", "label": "四根权杖拱门", "meaning": "稳固的基础与庆典", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.5}},
        {"id": "m3", "label": "城堡背景", "meaning": "安全的归宿与家园", "bbox": {"x": 0.1, "y": 0.05, "w": 0.8, "h": 0.2}},
    ],
    "wands_5": [
        {"id": "m1", "label": "争执的人群", "meaning": "冲突与竞争，多元观点", "bbox": {"x": 0.15, "y": 0.2, "w": 0.7, "h": 0.5}},
        {"id": "m2", "label": "交叉的权杖", "meaning": "对立与挑战，需要决断", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.4}},
    ],
    "wands_6": [
        {"id": "m1", "label": "骑马的胜者", "meaning": "胜利与荣耀，领导力", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "六根权杖", "meaning": "公众认可与成就", "bbox": {"x": 0.35, "y": 0.1, "w": 0.3, "h": 0.3}},
        {"id": "m3", "label": "欢呼的群众", "meaning": "社会支持与赞美", "bbox": {"x": 0.1, "y": 0.55, "w": 0.8, "h": 0.2}},
    ],
    "wands_7": [
        {"id": "m1", "label": "防御的战士", "meaning": "坚守立场，保卫成果", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "七根权杖", "meaning": "多重挑战，需要勇气", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.4}},
    ],
    "wands_8": [
        {"id": "m1", "label": "疾驰的信使", "meaning": "快速行动，消息传递", "bbox": {"x": 0.25, "y": 0.15, "w": 0.5, "h": 0.5}},
        {"id": "m2", "label": "八根权杖", "meaning": "迅速的进展，势不可挡", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.3}},
        {"id": "m3", "label": "远方的风景", "meaning": "目标即将到达", "bbox": {"x": 0.05, "y": 0.6, "w": 0.9, "h": 0.25}},
    ],
    "wands_9": [
        {"id": "m1", "label": "疲惫的战士", "meaning": "毅力与坚韧，最后的考验", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "九根权杖", "meaning": "即将完成，需要坚持", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.4}},
    ],
    "wands_10": [
        {"id": "m1", "label": "负重前行的人", "meaning": "责任与负担，压力过重", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "十根权杖", "meaning": "沉重的负担，需要释放", "bbox": {"x": 0.35, "y": 0.1, "w": 0.3, "h": 0.5}},
    ],
    "wands_page": [
        {"id": "m1", "label": "年轻的信使", "meaning": "新消息，探索的开始", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的权杖", "meaning": "热情与潜力，创造的种子", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.3}},
    ],
    "wands_knight": [
        {"id": "m1", "label": "骑马的骑士", "meaning": "行动与冒险，冲劲十足", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.6}},
        {"id": "m2", "label": "飞扬的鬃毛", "meaning": "激情与自由，不羁的精神", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.2}},
    ],
    "wands_queen": [
        {"id": "m1", "label": "自信的女王", "meaning": "魅力与领导力，温暖的力量", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的权杖", "meaning": "创造力的掌控", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.3}},
    ],
    "wands_king": [
        {"id": "m1", "label": "威严的国王", "meaning": "权威与远见，成熟的领导", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的权杖", "meaning": "意志力的体现", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.35}},
    ],

    # ═══ 圣杯 Cups ═══
    "cups_ace": [
        {"id": "m1", "label": "从云中伸出的手", "meaning": "情感的馈赠，直觉的觉醒", "bbox": {"x": 0.35, "y": 0.05, "w": 0.3, "h": 0.15}},
        {"id": "m2", "label": "圣杯", "meaning": "情感的容器，爱的象征", "bbox": {"x": 0.35, "y": 0.15, "w": 0.3, "h": 0.2}},
        {"id": "m3", "label": "流淌的水", "meaning": "情感的流动，直觉的源泉", "bbox": {"x": 0.3, "y": 0.3, "w": 0.4, "h": 0.2}},
        {"id": "m4", "label": "莲花与花园", "meaning": "情感的绽放，内在的丰盛", "bbox": {"x": 0.1, "y": 0.55, "w": 0.8, "h": 0.3}},
    ],
    "cups_2": [
        {"id": "m1", "label": "相互倾倒的杯子", "meaning": "情感的交流与共鸣", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.3}},
        {"id": "m2", "label": "舞蹈的人物", "meaning": "和谐与伙伴关系", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.4}},
        {"id": "m3", "label": "月亮与星辰", "meaning": "直觉与情感的指引", "bbox": {"x": 0.1, "y": 0.05, "w": 0.8, "h": 0.15}},
    ],
    "cups_3": [
        {"id": "m1", "label": "三位庆祝的女性", "meaning": "友谊与欢庆，社交的喜悦", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "手中的圣杯", "meaning": "分享与庆祝", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.2}},
    ],
    "cups_4": [
        {"id": "m1", "label": "沉思的人", "meaning": "内省与不满，情感的倦怠", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "三个被忽视的杯子", "meaning": "已有的机会被忽略", "bbox": {"x": 0.15, "y": 0.55, "w": 0.7, "h": 0.2}},
    ],
    "cups_5": [
        {"id": "m1", "label": "失落的身影", "meaning": "悲伤与失望，失去的痛苦", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "倾倒的杯子", "meaning": "失去与遗憾", "bbox": {"x": 0.2, "y": 0.4, "w": 0.6, "h": 0.2}},
    ],
    "cups_6": [
        {"id": "m1", "label": "回忆的场景", "meaning": "怀旧与美好的回忆", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "六个杯子", "meaning": "过去的美好，童年的纯真", "bbox": {"x": 0.25, "y": 0.3, "w": 0.5, "h": 0.3}},
    ],
    "cups_7": [
        {"id": "m1", "label": "幻想的景象", "meaning": "想象与诱惑，选择的困惑", "bbox": {"x": 0.15, "y": 0.1, "w": 0.7, "h": 0.5}},
        {"id": "m2", "label": "七个杯子", "meaning": "多种可能性，需要辨别", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.4}},
    ],
    "cups_8": [
        {"id": "m1", "label": "转身离开的人", "meaning": "放下与前行，寻找更深的意义", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "八个杯子", "meaning": "已建立的情感基础", "bbox": {"x": 0.2, "y": 0.35, "w": 0.6, "h": 0.3}},
    ],
    "cups_9": [
        {"id": "m1", "label": "满足的愿望", "meaning": "愿望成真，情感的圆满", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "九个杯子", "meaning": "丰盛与满足", "bbox": {"x": 0.2, "y": 0.2, "w": 0.6, "h": 0.4}},
    ],
    "cups_10": [
        {"id": "m1", "label": "幸福的家庭", "meaning": "情感的圆满，家庭的和谐", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "彩虹与十个杯子", "meaning": "祝福与完满，情感的升华", "bbox": {"x": 0.15, "y": 0.05, "w": 0.7, "h": 0.3}},
    ],
    "cups_page": [
        {"id": "m1", "label": "凝视圣杯的青年", "meaning": "情感的探索，直觉的觉醒", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的圣杯", "meaning": "情感的礼物，爱的讯息", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.2}},
    ],
    "cups_knight": [
        {"id": "m1", "label": "骑白马的骑士", "meaning": "浪漫的追求，理想的化身", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.6}},
        {"id": "m2", "label": "手中的圣杯", "meaning": "情感的献礼", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.2}},
    ],
    "cups_queen": [
        {"id": "m1", "label": "温柔的女王", "meaning": "同理心与直觉，情感的智慧", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的圣杯", "meaning": "情感的滋养", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.2}},
    ],
    "cups_king": [
        {"id": "m1", "label": "智慧的国王", "meaning": "情感的成熟，直觉的权威", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的圣杯", "meaning": "情感的掌控", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.3}},
    ],

    # ═══ 宝剑 Swords ═══
    "swords_ace": [
        {"id": "m1", "label": "从云中伸出的手", "meaning": "理性的力量，思维的觉醒", "bbox": {"x": 0.35, "y": 0.05, "w": 0.3, "h": 0.15}},
        {"id": "m2", "label": "宝剑", "meaning": "真理与正义，思维的锐利", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.4}},
        {"id": "m3", "label": "王冠与橄榄枝", "meaning": "胜利与和平，思维的成果", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.15}},
    ],
    "swords_2": [
        {"id": "m1", "label": "蒙眼的女性", "meaning": "内心的平衡，不做判断", "bbox": {"x": 0.35, "y": 0.15, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "交叉的双剑", "meaning": "对立与平衡，二元性", "bbox": {"x": 0.3, "y": 0.25, "w": 0.4, "h": 0.3}},
    ],
    "swords_3": [
        {"id": "m1", "label": "心碎的女性", "meaning": "悲伤与背叛，情感的创伤", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "三把宝剑", "meaning": "痛苦的根源，思维的伤害", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.3}},
    ],
    "swords_4": [
        {"id": "m1", "label": "冥想的人物", "meaning": "休息与恢复，内在的平静", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "四把宝剑", "meaning": "暂时的停顿，思维的休憩", "bbox": {"x": 0.2, "y": 0.35, "w": 0.6, "h": 0.2}},
    ],
    "swords_5": [
        {"id": "m1", "label": "胜利者与失败者", "meaning": "竞争的结果，胜负的代价", "bbox": {"x": 0.2, "y": 0.2, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "散落的宝剑", "meaning": "冲突后的残局", "bbox": {"x": 0.15, "y": 0.5, "w": 0.7, "h": 0.2}},
    ],
    "swords_6": [
        {"id": "m1", "label": "乘船远行", "meaning": "过渡与转变，离开困境", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "六把宝剑", "meaning": "携带的智慧，过去的教训", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.3}},
    ],
    "swords_7": [
        {"id": "m1", "label": "偷窃者", "meaning": "策略与机智，非常规手段", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "五把被偷的剑", "meaning": "已获取的优势", "bbox": {"x": 0.2, "y": 0.4, "w": 0.6, "h": 0.2}},
    ],
    "swords_8": [
        {"id": "m1", "label": "被束缚的人物", "meaning": "限制与困境，思维的牢笼", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "八把宝剑", "meaning": "自我设限，恐惧的束缚", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.4}},
    ],
    "swords_9": [
        {"id": "m1", "label": "噩梦中的人", "meaning": "焦虑与恐惧，思维的折磨", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "九把宝剑", "meaning": "夜间的困扰，思维的负担", "bbox": {"x": 0.15, "y": 0.15, "w": 0.7, "h": 0.3}},
    ],
    "swords_10": [
        {"id": "m1", "label": "倒地的人物", "meaning": "终结与重生，思维的转变", "bbox": {"x": 0.3, "y": 0.3, "w": 0.4, "h": 0.4}},
        {"id": "m2", "label": "十把宝剑", "meaning": "彻底的结束，新的开始", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.4}},
    ],
    "swords_page": [
        {"id": "m1", "label": "专注的青年", "meaning": "思维的探索，好奇心", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的宝剑", "meaning": "真理的追求", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.3}},
    ],
    "swords_knight": [
        {"id": "m1", "label": "冲锋的骑士", "meaning": "果断与行动，思维的力量", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.6}},
        {"id": "m2", "label": "高举的宝剑", "meaning": "真理的捍卫", "bbox": {"x": 0.4, "y": 0.1, "w": 0.2, "h": 0.3}},
    ],
    "swords_queen": [
        {"id": "m1", "label": "冷静的女王", "meaning": "智慧与清晰，思维的权威", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的宝剑", "meaning": "判断力的体现", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.3}},
    ],
    "swords_king": [
        {"id": "m1", "label": "威严的国王", "meaning": "思维的权威，理性的力量", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "高举的宝剑", "meaning": "真理与正义", "bbox": {"x": 0.4, "y": 0.1, "w": 0.2, "h": 0.35}},
    ],

    # ═══ 星币 Pentacles ═══
    "pentacles_ace": [
        {"id": "m1", "label": "从云中伸出的手", "meaning": "物质的馈赠，财富的机会", "bbox": {"x": 0.35, "y": 0.05, "w": 0.3, "h": 0.15}},
        {"id": "m2", "label": "星币", "meaning": "财富与价值，物质的基础", "bbox": {"x": 0.35, "y": 0.15, "w": 0.3, "h": 0.2}},
        {"id": "m3", "label": "花园与泉水", "meaning": "丰盛与滋养，物质的繁荣", "bbox": {"x": 0.1, "y": 0.5, "w": 0.8, "h": 0.35}},
    ],
    "pentacles_2": [
        {"id": "m1", "label": "杂耍的人物", "meaning": "平衡与适应，灵活应对", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "两个星币", "meaning": "双重关注，物质与精神的平衡", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.2}},
    ],
    "pentacles_3": [
        {"id": "m1", "label": "工匠与学徒", "meaning": "学习与精进，技能的培养", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "三个星币", "meaning": "合作与建设，团队的成果", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.2}},
    ],
    "pentacles_4": [
        {"id": "m1", "label": "紧握星币的人", "meaning": "守财与固执，物质的执念", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "四个星币", "meaning": "稳固的基础，物质的安全", "bbox": {"x": 0.25, "y": 0.25, "w": 0.5, "h": 0.3}},
    ],
    "pentacles_5": [
        {"id": "m1", "label": "贫困的景象", "meaning": "物质的匮乏，困境中的坚韧", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "五个星币", "meaning": "失去与挑战，需要帮助", "bbox": {"x": 0.25, "y": 0.3, "w": 0.5, "h": 0.2}},
    ],
    "pentacles_6": [
        {"id": "m1", "label": "慷慨的给予", "meaning": "分享与互助，物质的流通", "bbox": {"x": 0.25, "y": 0.15, "w": 0.5, "h": 0.5}},
        {"id": "m2", "label": "六个星币", "meaning": "公平与平衡，物质的交换", "bbox": {"x": 0.3, "y": 0.2, "w": 0.4, "h": 0.2}},
    ],
    "pentacles_7": [
        {"id": "m1", "label": "等待收获的人", "meaning": "耐心与坚持，长期的投入", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.5}},
        {"id": "m2", "label": "七个星币", "meaning": "已付出的努力，等待结果", "bbox": {"x": 0.2, "y": 0.35, "w": 0.6, "h": 0.25}},
    ],
    "pentacles_8": [
        {"id": "m1", "label": "专注的工匠", "meaning": "精益求精，技艺的打磨", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "八个星币", "meaning": "持续的产出，质量的保证", "bbox": {"x": 0.25, "y": 0.25, "w": 0.5, "h": 0.25}},
    ],
    "pentacles_9": [
        {"id": "m1", "label": "满足的女性", "meaning": "物质的丰盛，独立的满足", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "九个星币", "meaning": "个人成就，物质的回报", "bbox": {"x": 0.2, "y": 0.2, "w": 0.6, "h": 0.3}},
    ],
    "pentacles_10": [
        {"id": "m1", "label": "家族的传承", "meaning": "家族的财富，世代的积累", "bbox": {"x": 0.2, "y": 0.15, "w": 0.6, "h": 0.5}},
        {"id": "m2", "label": "十个星币", "meaning": "物质的圆满，家族的荣耀", "bbox": {"x": 0.25, "y": 0.2, "w": 0.5, "h": 0.3}},
    ],
    "pentacles_page": [
        {"id": "m1", "label": "凝视星币的青年", "meaning": "物质的探索，学习的开始", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的星币", "meaning": "物质的礼物，机会的种子", "bbox": {"x": 0.35, "y": 0.2, "w": 0.3, "h": 0.2}},
    ],
    "pentacles_knight": [
        {"id": "m1", "label": "稳重的骑士", "meaning": "踏实与勤奋，稳步前进", "bbox": {"x": 0.25, "y": 0.1, "w": 0.5, "h": 0.6}},
        {"id": "m2", "label": "手中的星币", "meaning": "物质的追求", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.2}},
    ],
    "pentacles_queen": [
        {"id": "m1", "label": "丰饶的女王", "meaning": "物质的滋养，实际的关怀", "bbox": {"x": 0.3, "y": 0.15, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的星币", "meaning": "财富的掌控", "bbox": {"x": 0.4, "y": 0.2, "w": 0.2, "h": 0.2}},
    ],
    "pentacles_king": [
        {"id": "m1", "label": "富有的国王", "meaning": "物质的成功，实际的智慧", "bbox": {"x": 0.3, "y": 0.1, "w": 0.4, "h": 0.5}},
        {"id": "m2", "label": "手中的星币", "meaning": "财富的权威", "bbox": {"x": 0.4, "y": 0.15, "w": 0.2, "h": 0.3}},
    ],
}


def add_motifs_to_file(filepath):
    """为一个 JSON 文件中的所有卡牌添加 motif 数据"""
    with open(filepath, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    # ID 映射：word-based -> number-based
    WORD_TO_NUM = {
        "two": "2", "three": "3", "four": "4", "five": "5",
        "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
    }

    modified = False
    for card in cards:
        card_id = card.get('id', '')
        if card_id in MINOR_MOTIFS and 'motifs' not in card:
            card['motifs'] = MINOR_MOTIFS[card_id]
            modified = True
            print(f"  + {card_id}: {len(MINOR_MOTIFS[card_id])} motifs")
        elif 'motifs' not in card:
            # 尝试 word -> num 映射
            parts = card_id.rsplit('_', 1)
            if len(parts) == 2:
                prefix, suffix = parts
                if suffix in WORD_TO_NUM:
                    mapped_id = f"{prefix}_{WORD_TO_NUM[suffix]}"
                    if mapped_id in MINOR_MOTIFS:
                        card['motifs'] = MINOR_MOTIFS[mapped_id]
                        modified = True
                        print(f"  + {card_id} (via {mapped_id}): {len(MINOR_MOTIFS[mapped_id])} motifs")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(cards, f, ensure_ascii=False, indent=2)
        print(f"  -> Saved {filepath}")
    else:
        print(f"  = {filepath}: no changes needed")

    return modified


if __name__ == '__main__':
    base = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'cards')

    files = [
        'minor_wands.json',
        'minor_cups.json',
        'minor_swords.json',
        'minor_pentacles.json',
    ]

    total = 0
    for fname in files:
        filepath = os.path.join(base, fname)
        if os.path.exists(filepath):
            print(f"\nProcessing {fname}...")
            add_motifs_to_file(filepath)
            total += 1
        else:
            print(f"  ! {filepath} not found")

    print(f"\nDone. Processed {total} files.")
