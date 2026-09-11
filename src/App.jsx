import QRCode from "qrcode";
import { useState, useEffect, useRef } from "react";
import { auth, googleProvider, db } from "./firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { signInWithPopup, signOut, onAuthStateChanged, OAuthProvider } from "firebase/auth";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc,
  query, orderBy, onSnapshot, serverTimestamp, arrayUnion, where, getDocs,
  increment,
} from "firebase/firestore";

const T = {
  zh: {
    appName: "What'sfind", subtitle: "防冒領遺失物 · 走失寵物協尋平台",
    login: "登入", logout: "登出", welcomeTitle: "歡迎使用What'sfind", welcomeDesc: "免費、安全、即時聊天，幫你找回遺失物品",
    googleLogin: "使用 Google 帳號登入", appleLogin: "使用 Apple 帳號登入", termsAgree: "登入即表示您同意我們的服務條款與隱私權政策",
    all: "全部", grpAirport: "機場行李", grpGeneral: "物品尋找", lost: "行李遺失", wrong: "行李誤取", delayed: "行李延誤", damaged: "行李損壞", found: "拾獲物品", seeking: "尋找遺失物",
    wallet: "錢包", id_doc: "證件", electronics: "3C電子", keys: "鑰匙",
    allAirports: "所有機場", allDates: "所有日期", search: "🔎 搜尋⋯",
    posts: "則留言", resolved: "累計尋回", noResults: "找不到相關留言",
    publish: "＋ 發佈", newPost: "發佈新留言", cancel: "取消",
    type: "類型", airport: "機場", selectAirport: "選擇機場", nearestAirport: "📍 選擇最近機場",
    flight: "航班編號", flightPlaceholder: "例：CI-752", date: "日期",
    title: "標題", titlePlaceholder: "簡述遺失或拾獲物品",
    description: "詳細描述", descPlaceholder: "描述物品特徵⋯",
    photos: "照片（最多4張）", upload: "上傳",
    verifyTitle: "防冒領驗證題", verifyDesc: "設定只有失主才能回答的問題。",
    verifyQ: "驗證題", addVerifyQ: "＋ 新增驗證題", remove: "移除", reselect: "← 重選",
    answerPlaceholder: "正確答案（僅您可見）",
    contact: "聯絡方式", contactHidden: "聯絡方式已隱藏", contactHiddenDesc: "請先通過驗證才能查看聯絡資訊。",
    contactVisible: "通過驗證才能看到", contactPlaceholder: "Line / Email / 電話",
    publishBtn: "📤 發佈留言", publishSuccess: "發佈成功！",
    detail: "留言詳情", resolved2: "已尋回", shield: "防冒領驗證保護中",
    claimBtn: "🔑 我是失主，提交認領", loginToClaim: "🔑 登入後認領",
    pending: "審核中", verified: "驗證通過！",
    chatWith: "💬 與發文者聊天", chatRoom: "聊天室", startChat: "開始對話吧！",
    send: "送出", typeMsg: "輸入訊息⋯",
    resolveBtn: "🎉 我已找回物品", resolveConfirm: "確認已找回物品？", confirm: "確認找回了！",
    deleteBtn: "🗑️ 刪除留言", deleteConfirm: "確定要刪除這篇留言嗎？此操作無法復原。",
    reportBtn: "🚩 檢舉此留言", reportConfirm: "確定要檢舉此留言嗎？我們會盡快審核。", reportSent: "已送出檢舉，感謝您的回報。",
    adminDelete: "🗑️ 管理員刪除", adminDeleteConfirm: "以管理員身份刪除此留言？",
    claims: "認領申請", approved: "已通過", rejected: "已拒絕", pendingReview: "待審核",
    approve: "✅ 通過", reject: "❌ 拒絕", chat: "💬 聊天",
    answer: "回答", question: "Q",
    submitClaim: "🔑 提交認領", claimWarning: "冒領涉及刑法詐欺及侵占罪。",
    yourAnswer: "您的答案", submit: "📤 送出",
    claimSuccess: "驗證通過！", claimSuccessDesc: "答案正確！可查看聯絡方式。",
    claimSent: "申請已送出", claimSentDesc: "等待審核中。", ok: "好的",
    donateTitle: "☕ 恭喜找回物品！", donateDesc: "歡迎小額贊助讓平台持續運作。",
    donate: "💚 贊助", skipDonate: "先不用", custom: "自訂", thanks: "🙏 祝您旅途愉快！", done: "完成",
    replies: "回覆", noReplies: "尚無回覆", replyPlaceholder: "留下回覆⋯",
    notifTitle: "開啟通知", notifDesc: "有人認領或回覆時即時提醒您", notifOpen: "開啟",
    notifAddHome: "加入主畫面", notifAddHomeDesc: "加入主畫面後即可收到即時通知", notifLearn: "了解",
    notifEnabled: "🔔 通知已開啟",
    notifUnsupported: "您的瀏覽器不支援通知功能。\n\niPhone 用戶請：\n1. 點下方「分享」按鈕\n2. 選「加入主畫面」\n3. 從主畫面開啟網站\n即可收到通知。",
    notifDenied: "通知已被封鎖。\n\n請到瀏覽器設定 → 網站設定 → 通知 → 允許此網站。",
    warning: "⚠️ 重要警語", warningText: "本平台僅提供資訊交流，不負責物品保管歸還。冒領涉及刑法第335條侵占罪及第339條詐欺罪。",
    terms: "服務條款", privacy: "隱私權政策", contactUs: "聯絡我們",
    termsContent: "「What'sfind」（以下簡稱本平台）為遺失物互助平台，所有權歸 What'sfind 團隊所有。\n\n一、智慧財產權\n本平台之名稱、標誌、介面設計、程式碼、資料庫結構及所有相關內容均受中華民國著作權法及國際著作權公約保護。未經本平台書面授權，禁止任何形式之複製、修改、散布、反向工程或商業利用。\n\n二、使用資格\n1. 使用者須年滿13歲\n2. 未滿18歲之使用者應取得法定代理人同意\n3. 使用者須以真實身分註冊，不得冒用他人帳號\n\n三、使用規範\n1. 使用者對其發佈之內容負完全法律責任\n2. 禁止發佈虛假資訊、冒領他人物品\n3. 冒領行為涉及刑法第335條侵占罪及第339條詐欺罪\n4. 禁止利用本平台進行任何違法行為\n5. 禁止發佈色情、暴力、歧視或其他不當內容\n6. 每日發文上限5篇，認領上限10次\n\n四、免責聲明\n1. 本平台僅提供資訊媒合服務，不參與物品保管、交接或金錢交易\n2. 使用者間之交易糾紛由當事人自行處理\n3. 本平台不保證遺失物品一定能尋回\n4. 因不可抗力導致之服務中斷，本平台不負賠償責任\n5. 本平台為民間互助性質，不取代民法第803條規定之法定報案程序。拾得遺失物者仍應依法通知失主或報告警察機關，相關法律責任由拾得人自行承擔\n6. 本平台不代為保管、鑑定或處分任何物品\n7. 寵物協尋功能為互助性質，拾獲走失動物者仍應依動物保護法第14條通報動物保護處或送交收容所\n\n五、帳號管理\n1. 違反使用規範者，本平台有權封鎖帳號\n2. 被封鎖之帳號不得要求退還任何費用\n3. 使用者可隨時申請刪除帳號及相關資料\n\n六、條款修訂\n本平台保留隨時修訂本條款之權利，修訂後公告於平台。繼續使用本平台即表示同意修訂後之條款。\n\n七、準據法\n本條款以中華民國法律為準據法，如有爭議以台灣桃園地方法院為第一審管轄法院。\n\n© 2026 What'sfind 版權所有 All Rights Reserved.",
    privacyContent: "What'sfind 重視您的隱私權，本政策說明我們如何蒐集、使用及保護您的個人資料。\n\n一、蒐集之資料\n1. 帳號資訊（Google 帳號名稱、Email）\n2. 物品描述、照片、地點資訊\n3. 驗證題答案（加密儲存）\n4. 聯絡方式（僅通過認領審核後可見）\n5. 裝置資訊、IP 位址（系統自動記錄）\n\n二、資料使用目的\n僅用於遺失物媒合服務，不做其他商業用途。\n\n三、Cookie 與追蹤技術\n本平台使用 Google Analytics 分析流量數據、Google AdSense 顯示廣告。這些第三方服務可能使用 Cookie 或類似技術蒐集匿名使用資訊。繼續使用本平台即表示您同意此項蒐集。\n\n四、資料保護措施\n1. 聯絡方式預設隱藏，採加密傳輸\n2. 驗證答案存於私密子集合，僅發文者可讀取\n3. 照片上傳15天後自動刪除\n4. 使用 Firebase 安全規則控管存取權限\n\n五、資料跨境傳輸\n本平台使用 Google Firebase 雲端服務，您的資料可能儲存於美國或其他國家的伺服器。Google 已通過相關國際資料保護認證。使用本平台即表示您同意此跨境傳輸。\n\n六、第三方分享\n本平台不出售、不交換、不提供個人資料予第三方，除非法律要求。\n\n七、資料刪除\n使用者可隨時刪除自己的貼文及相關資料。如需完全刪除帳號資料，請透過「聯絡我們」申請，我們將於30日內處理。\n\n八、年齡限制\n本平台不適用於未滿13歲之兒童。若發現未滿13歲之使用者，我們將主動刪除其相關資料。\n\n九、個資事故處理\n如發生個人資料外洩事故，本平台將依個人資料保護法規定，於發現後72小時內通知受影響之當事人，並採取必要補救措施。\n\n十、政策修訂\n本隱私權政策如有修訂，將於平台公告。繼續使用本平台即表示同意修訂後之政策。\n\n本隱私權政策適用中華民國個人資料保護法。",
    copyright: "© 2026 What'sfind 版權所有 ⚖️ 未經授權禁止複製",
    close: "關閉", back: "← 返回", loading: "載入中⋯", loginFirst: "請先登入", goLogin: "前往登入",
    notifications: "通知", clearAll: "全部清除", noNotif: "目前沒有通知",
    claimNotif: "提交了認領申請", verifyNotif: "通過驗證認領", replyNotif: "回覆了留言", chatNotif: "傳了新訊息",
    today: "今天", yesterday: "昨天", daysAgo: "天前",
    // New features
    handoverConfirm: "📦 確認交接", handoverWait: "等待對方確認交接", handoverDone: "✅ 雙方已確認交接完成",
    handoverAsk: "確認物品已成功交接給對方？", ownerConfirmed: "失主已確認", finderConfirmed: "拾獲者已確認",
    rateTitle: "⭐ 評價對方", rateDesc: "為這次互助體驗打分", rateThanks: "感謝您的評價！",
    rateAvg: "平均評價", rateCount: "次評價",
    dashboard: "📊 管理儀表板", totalPosts: "總留言數", activePosts: "進行中", resolvedPosts: "已尋回", claimedReward: "已領感謝金", supportUs: "支持 What'sfind",
    hiddenPosts: "已隱藏", resolveRate: "尋回率", avgResponseTime: "平均回應",
    announcement: "📢 公告", newAnnouncement: "發布公告", announcePlaceholder: "輸入公告內容⋯",
    expired: "已過期", daysLeft: "天後過期", autoExpire: "此留言已超過90天",
    reward: "💰 感謝金", rewardPlaceholder: "願意提供的金額（選填）", rewardLabel: "感謝金",
    petMode: "🐾 尋寵", itemMode: "📦 尋物", petLost: "🐾 走失中", petFound: "✅ 已找回", petReward: "協尋金", myPetLost: "我的寵物走失了", foundPet: "我發現走失寵物", petReminder: "寵物協尋提醒",
    location: "地點", selectLocation: "選擇地點", customLocation: "自訂地點", locationPlaceholder: "例：台北車站、全家便利商店⋯",
    tutorial1: "歡迎使用", tutorial1d: "免費的 C2C 遺失物互助平台。\n獨創防冒領驗證、即時聊天、交接紀錄單，安全找回你的物品。",
    tutorial2: "發佈遺失物品", tutorial2d: "登入後點「＋ 發佈」，填寫物品描述、機場、航班等資訊，並設定防冒領驗證題。",
    tutorial3: "防冒領驗證機制", tutorial3d: "設定只有真正失主才能回答的問題（如行李條號碼、密碼鎖等），聯絡方式在驗證通過前完全隱藏。",
    tutorial4: "認領物品", tutorial4d: "看到自己的物品？點「我是失主」回答驗證問題，通過後即可查看聯絡方式。",
    tutorial5: "即時聊天", tutorial5d: "驗證通過後可直接與對方聊天，安全溝通歸還事宜。",
    tutorial6: "即時通知", tutorial6d: "開啟通知功能，有人認領或回覆時立即收到提醒，不錯過任何訊息。",
    skip: "跳過", next: "下一步", start: "開始使用 🚀",
    other: "其他", customAirport: "請輸入機場名稱",
    nearbyKm: "附近 {km} 公里內", nearbyLatest: "最新貼文", nearbyPet: "正在協尋中", seeMore: "看更多 →",
    statSearching: "尋找中", statFound: "已尋回", statReward: "感謝金", statPetLost: "走失中", statPetFound: "已找回", statPetReward: "協尋金",
    typeLost: "😰 我遺失了", typeFound: "🔍 我撿到了", typePetLost: "😢 我的寵物走失了", typePetFound: "🔍 我發現走失寵物",
    postTypeLabel: "發文類型 *",
    encourageTitle: "❤️ 每一次找回，都是一個好消息", encourageDesc: "謝謝那位願意幫忙的人，讓我的東西回來了。",
    reportFound: "📢 回報已找到", reportFoundConfirm: "您認為此物品/寵物已被找到？\n\n我們會通知發文者確認。",
    reportFoundDone: "✅ 已回報，我們會通知發文者確認。感謝您的協助！",
    expiredNotice: "🔴 此貼文已超過 60 天，已自動標記為過期",
    expiringSoon: "⏰ 還有 {days} 天將自動過期",
    expiringHint: "如果已經找到，請點「✅ 我已找回物品」更新狀態",
    tut1: "歡迎使用 What'sfind", tut1d: "台灣第一個防冒領遺失物互助平台。\n免費 · 安全 · 即時聊天\n找回遺失物品與走失毛孩。",
    tut2: "一鍵發文，快速找回", tut2d: "選擇類別、填寫描述、上傳照片。\n支援 52 座國際機場與 GPS 定位。\n附近的人能立刻看到你的貼文。",
    tut3: "獨創防冒領驗證", tut3d: "設定只有真正失主才能回答的問題。\n驗證通過才能查看聯絡資訊。\n交接雙方簽名，自動產生紀錄單。",
    tut4: "走失寵物全民協尋", tut4d: "切換到尋寵模式，發布走失或發現的寵物。\n支援狗、貓、鳥類等多種寵物。\n分享到社群擴大曝光範圍。",
    tut5: "安全防護機制", tut5d: "連結自動遮蔽 ***、詐騙關鍵字即時偵測。\n聊天訊息可檢舉，管理員即時處理。\n165 反詐騙專線隨手可查。",
    tut6: "即時聊天與通知", tut6d: "認領通過後即可線上聊天。\n訊息即時推播，不錯過任何消息。\n完成交接後互相評價，建立信任。",
    tut7: "隨時隨地使用", tut7d: "手機加入主畫面，像 App 一樣使用。\n支援中、英、日、韓 4 種語言。\n完全免費，不收取任何費用。",
  },
  en: {
    appName: "What'sfind", subtitle: "Anti-fraud Lost & Found Platform",
    login: "Login", logout: "Logout", welcomeTitle: "Welcome to What'sfind", welcomeDesc: "Free, secure, real-time chat to recover lost items",
    googleLogin: "Sign in with Google", appleLogin: "Sign in with Apple", termsAgree: "By signing in, you agree to our Terms of Service and Privacy Policy",
    all: "All", grpAirport: "Airport", grpGeneral: "General", lost: "Lost", wrong: "Wrong Bag", delayed: "Delayed", damaged: "Damaged", found: "Found", seeking: "Seeking Item",
    wallet: "Wallet", id_doc: "ID/Passport", electronics: "Electronics", keys: "Keys",
    allAirports: "All Airports", allDates: "All Dates", search: "Search...",
    posts: "Posts", resolved: "Resolved", noResults: "No results found",
    publish: "＋ Post", newPost: "New Post", cancel: "Cancel",
    type: "Type", airport: "Airport", selectAirport: "Select Airport", nearestAirport: "Select Nearest",
    flight: "Flight No.", flightPlaceholder: "e.g. CI-752", date: "Date",
    title: "Title", titlePlaceholder: "Brief description of item",
    description: "Details", descPlaceholder: "Describe the item...",
    photos: "Photos (max 4)", upload: "Upload",
    verifyTitle: "Verification Questions", verifyDesc: "Set questions only the real owner can answer.",
    verifyQ: "Question", addVerifyQ: "＋ Add Question", remove: "Remove", reselect: "← Reselect",
    answerPlaceholder: "Correct answer (only you can see)",
    contact: "Contact", contactHidden: "Contact Hidden", contactHiddenDesc: "Pass verification to view contact info.",
    contactVisible: "Visible after verification", contactPlaceholder: "Line / Email / Phone",
    publishBtn: "📤 Publish", publishSuccess: "Published!",
    detail: "Details", resolved2: "Resolved", shield: "Anti-fraud verification active",
    claimBtn: "🔑 I'm the owner, submit claim", loginToClaim: "🔑 Login to claim",
    pending: "Under review", verified: "Verified!",
    chatWith: "💬 Chat with poster", chatRoom: "Chats", startChat: "Start chatting!",
    send: "Send", typeMsg: "Type a message...",
    resolveBtn: "🎉 Item found", resolveConfirm: "Confirm item found?", confirm: "Yes, found it!",
    deleteBtn: "🗑️ Delete post", deleteConfirm: "Delete this post? This cannot be undone.",
    reportBtn: "🚩 Report this post", reportConfirm: "Report this post? We'll review it shortly.", reportSent: "Report submitted. Thank you.",
    adminDelete: "🗑️ Admin delete", adminDeleteConfirm: "Delete this post as admin?",
    claims: "Claims", approved: "Approved", rejected: "Rejected", pendingReview: "Pending",
    approve: "✅ Approve", reject: "❌ Reject", chat: "💬 Chat",
    answer: "Answer", question: "Q",
    submitClaim: "🔑 Submit Claim", claimWarning: "Falsely claiming items is a criminal offense.",
    yourAnswer: "Your answer", submit: "📤 Submit",
    claimSuccess: "Verified!", claimSuccessDesc: "Correct! You can now view contact info.",
    claimSent: "Claim submitted", claimSentDesc: "Waiting for review.", ok: "OK",
    donateTitle: "☕ Congrats!", donateDesc: "Support the platform with a small donation.",
    donate: "💚 Donate", skipDonate: "Skip", custom: "Custom", thanks: "🙏 Safe travels!", done: "Done",
    replies: "Replies", noReplies: "No replies yet", replyPlaceholder: "Write a reply...",
    notifTitle: "Enable Notifications", notifDesc: "Get notified when someone claims or replies", notifOpen: "Enable",
    notifAddHome: "Add to Home Screen", notifAddHomeDesc: "Add to home screen to receive notifications", notifLearn: "Learn",
    notifEnabled: "🔔 Notifications enabled",
    notifUnsupported: "Your browser doesn't support notifications.\n\nFor iPhone:\n1. Tap Share button\n2. Select 'Add to Home Screen'\n3. Open from home screen",
    notifDenied: "Notifications blocked.\n\nGo to browser settings → Site settings → Notifications → Allow.",
    warning: "⚠️ Disclaimer", warningText: "This platform is for information exchange only. Falsely claiming items is a criminal offense.",
    terms: "Terms", privacy: "Privacy", contactUs: "Contact",
    termsContent: "What'sfind is a free platform. Users are responsible for posted content. The platform only facilitates information exchange.",
    privacyContent: "We collect account info and item descriptions for matching services only. Contact info is hidden by default. We don't sell personal data.",
    copyright: "© 2026 What'sfind 版權所有 ⚖️ 未經授權禁止複製",
    close: "Close", back: "← Back", loading: "Loading...", loginFirst: "Please login first", goLogin: "Go to Login",
    notifications: "Notifications", clearAll: "Clear all", noNotif: "No notifications",
    claimNotif: "submitted a claim", verifyNotif: "passed verification", replyNotif: "replied", chatNotif: "sent a message",
    today: "Today", yesterday: "Yesterday", daysAgo: "days ago",
    tutorial1: "Welcome", tutorial1d: "A platform to help travelers find lost luggage at airports.",
    tutorial2: "Post Lost Items", tutorial2d: "Login, tap '＋ Post', fill in details and set verification questions.",
    tutorial3: "Anti-fraud Verification", tutorial3d: "Set questions only the real owner can answer. Contact info stays hidden until verified.",
    tutorial4: "Claim Items", tutorial4d: "Found your item? Tap 'I'm the owner' and answer verification questions.",
    tutorial5: "Real-time Chat", tutorial5d: "After verification, chat directly with the poster to arrange return.",
    tutorial6: "Notifications", tutorial6d: "Enable notifications to get instant alerts when someone claims or replies.",
    skip: "Skip", next: "Next", start: "Get Started 🚀",
    other: "Other", customAirport: "Enter airport name",
    nearbyKm: "Within {km} km", nearbyLatest: "Latest Posts", nearbyPet: "Searching Nearby", seeMore: "See more →",
    statSearching: "Searching", statFound: "Found", statReward: "Reward", statPetLost: "Missing", statPetFound: "Found", statPetReward: "Reward",
    typeLost: "😰 I lost something", typeFound: "🔍 I found something", typePetLost: "😢 My pet is missing", typePetFound: "🔍 I found a lost pet",
    postTypeLabel: "Post Type *",
    encourageTitle: "❤️ Every recovery is good news", encourageDesc: "Thank you to the kind person who helped bring it back.",
    reportFound: "📢 Report as Found", reportFoundConfirm: "Do you believe this item/pet has been found?\n\nWe will notify the poster to confirm.",
    reportFoundDone: "✅ Reported! We'll notify the poster. Thank you!",
    expiredNotice: "🔴 This post is over 60 days old and has been auto-expired",
    expiringSoon: "⏰ {days} days until auto-expire",
    expiringHint: "If found, please tap '✅ Mark as Found' to update",
    tut1: "Welcome to What'sfind", tut1d: "Taiwan's first anti-fraud lost & found platform.\nFree · Safe · Real-time Chat\nRecover lost items and missing pets.",
    tut2: "Post in One Click", tut2d: "Choose a category, describe, upload photos.\nSupports 52 international airports with GPS.\nNearby users can see your post instantly.",
    tut3: "Anti-Fraud Verification", tut3d: "Set questions only the real owner can answer.\nContact info shown only after verification.\nHandover receipt with both signatures.",
    tut4: "Community Pet Search", tut4d: "Switch to pet mode for lost or found pets.\nSupports dogs, cats, birds and more.\nShare to social media for wider reach.",
    tut5: "Security Protection", tut5d: "Links auto-masked ***, scam keywords detected.\nChat messages reportable, admin handles promptly.\n165 anti-fraud hotline available.",
    tut6: "Real-time Chat & Notifications", tut6d: "Chat directly after claim approval.\nInstant push notifications.\nRate each other after handover.",
    tut7: "Use Anywhere", tut7d: "Add to home screen, works like an app.\nSupports 4 languages: ZH, EN, JA, KO.\nCompletely free, no charges.",
    announcement: "📢 Notice", newAnnouncement: "New Notice", announcePlaceholder: "Enter announcement...",
    expired: "Expired", daysLeft: "days left", autoExpire: "This post is over 90 days old",
    reward: "💰 Reward", rewardPlaceholder: "Enter amount (optional)", rewardLabel: "Reward",
    petMode: "🐾 Pets", itemMode: "📦 Items", petLost: "🐾 Missing", petFound: "✅ Found", petReward: "Reward", myPetLost: "My pet is lost", foundPet: "I found a lost pet", petReminder: "Pet Finding Reminder",
    location: "Location", selectLocation: "Select Location", customLocation: "Enter manually", locationPlaceholder: "e.g. Station, convenience store...",
  },
  ja: {
    appName: "What'sfind", subtitle: "不正請求防止機能付き忘れ物プラットフォーム",
    login: "ログイン", logout: "ログアウト", welcomeTitle: "What'sfindへようこそ", welcomeDesc: "ログインして投稿や追跡ができます",
    googleLogin: "Googleでログイン", appleLogin: "Appleでログイン", termsAgree: "ログインすることで利用規約とプライバシーポリシーに同意します",
    all: "すべて", grpAirport: "空港荷物", grpGeneral: "一般", lost: "紛失", wrong: "取り違え", delayed: "遅延", damaged: "破損", found: "拾得", seeking: "探し物",
    wallet: "財布", id_doc: "身分証", electronics: "電子機器", keys: "鍵",
    allAirports: "全空港", allDates: "全日程", search: "検索...",
    posts: "件の投稿", resolved: "解決済み", noResults: "該当する投稿がありません",
    publish: "＋ 投稿", newPost: "新規投稿", cancel: "キャンセル",
    type: "種類", airport: "空港", selectAirport: "空港を選択", nearestAirport: "最寄りの空港",
    flight: "便名", flightPlaceholder: "例：CI-752", date: "日付",
    title: "タイトル", titlePlaceholder: "物品の簡単な説明",
    description: "詳細", descPlaceholder: "特徴を記述...",
    photos: "写真（最大4枚）", upload: "アップロード",
    verifyTitle: "なりすまし防止質問", verifyDesc: "本当の持ち主だけが答えられる質問を設定。",
    verifyQ: "質問", addVerifyQ: "＋ 質問を追加", remove: "削除", reselect: "← 再選択",
    answerPlaceholder: "正解（あなただけが見えます）",
    contact: "連絡先", contactHidden: "連絡先は非公開", contactHiddenDesc: "認証後に連絡先を確認できます。",
    contactVisible: "認証後に表示", contactPlaceholder: "Line / Email / 電話",
    publishBtn: "📤 投稿する", publishSuccess: "投稿完了！",
    detail: "詳細", resolved2: "解決済み", shield: "なりすまし防止認証中",
    claimBtn: "🔑 持ち主です、申請する", loginToClaim: "🔑 ログインして申請",
    pending: "審査中", verified: "認証済み！",
    chatWith: "💬 投稿者とチャット", chatRoom: "チャット", startChat: "会話を始めましょう！",
    send: "送信", typeMsg: "メッセージを入力...",
    resolveBtn: "🎉 見つかりました", resolveConfirm: "見つかりましたか？", confirm: "はい！",
    deleteBtn: "🗑️ 投稿を削除", deleteConfirm: "この投稿を削除しますか？元に戻せません。",
    reportBtn: "🚩 この投稿を報告", reportConfirm: "この投稿を報告しますか？", reportSent: "報告を送信しました。",
    adminDelete: "🗑️ 管理者削除", adminDeleteConfirm: "管理者としてこの投稿を削除しますか？",
    claims: "申請一覧", approved: "承認済み", rejected: "却下", pendingReview: "審査中",
    approve: "✅ 承認", reject: "❌ 却下", chat: "💬 チャット",
    answer: "回答", question: "Q",
    submitClaim: "🔑 申請する", claimWarning: "他人の物品を不正に取得することは犯罪です。",
    yourAnswer: "あなたの回答", submit: "📤 送信",
    claimSuccess: "認証完了！", claimSuccessDesc: "正解です！連絡先を確認できます。",
    claimSent: "申請送信済み", claimSentDesc: "審査をお待ちください。", ok: "OK",
    donateTitle: "☕ おめでとうございます！", donateDesc: "プラットフォームの運営を応援してください。",
    donate: "💚 寄付する", skipDonate: "スキップ", custom: "カスタム", thanks: "🙏 良い旅を！", done: "完了",
    replies: "返信", noReplies: "返信はまだありません", replyPlaceholder: "返信を書く...",
    notifTitle: "通知を有効にする", notifDesc: "申請や返信があった時に通知", notifOpen: "有効にする",
    notifAddHome: "ホーム画面に追加", notifAddHomeDesc: "ホーム画面から開くと通知が届きます", notifLearn: "詳細",
    notifEnabled: "🔔 通知は有効です",
    notifUnsupported: "お使いのブラウザは通知に対応していません。\n\niPhoneの場合：\n1.共有ボタンをタップ\n2.「ホーム画面に追加」を選択\n3.ホーム画面から開く",
    notifDenied: "通知がブロックされています。\n\nブラウザ設定→サイト設定→通知→許可してください。",
    warning: "⚠️ 免責事項", warningText: "本プラットフォームは情報交換のみを目的としています。不正な物品取得は犯罪です。",
    terms: "利用規約", privacy: "プライバシー", contactUs: "お問い合わせ",
    termsContent: "本プラットフォームは無料の相互支援サービスです。投稿内容はユーザーの責任です。",
    privacyContent: "アカウント情報と物品情報をマッチングサービスのために収集します。連絡先は非公開で暗号化通信を使用。第三者への販売はしません。",
    copyright: "© 2026 What'sfind 版權所有 ⚖️ 未經授權禁止複製",
    close: "閉じる", back: "← 戻る", loading: "読み込み中...", loginFirst: "ログインが必要です", goLogin: "ログインへ",
    notifications: "通知", clearAll: "すべて削除", noNotif: "通知はありません",
    claimNotif: "が申請しました", verifyNotif: "が認証されました", replyNotif: "が返信しました", chatNotif: "がメッセージを送りました",
    today: "今日", yesterday: "昨日", daysAgo: "日前",
    tutorial1: "ようこそ", tutorial1d: "空港で紛失した荷物を見つけるためのプラットフォームです。",
    tutorial2: "紛失物を投稿", tutorial2d: "ログインして「＋投稿」をタップ、詳細と認証質問を設定します。",
    tutorial3: "なりすまし防止", tutorial3d: "持ち主だけが答えられる質問を設定。認証前は連絡先が非公開。",
    tutorial4: "物品を申請", tutorial4d: "自分の物品を見つけたら「持ち主です」をタップして質問に回答。",
    tutorial5: "リアルタイムチャット", tutorial5d: "認証後、投稿者と直接チャットで返却の相談ができます。",
    tutorial6: "通知機能", tutorial6d: "通知を有効にすると、申請や返信があった時にすぐに分かります。",
    skip: "スキップ", next: "次へ", start: "始める 🚀",
    other: "その他", customAirport: "空港名を入力",
    nearbyKm: "半径 {km} km以内", nearbyLatest: "最新の投稿", nearbyPet: "近くで捜索中", seeMore: "もっと見る →",
    statSearching: "捜索中", statFound: "発見済み", statReward: "謝礼金", statPetLost: "行方不明", statPetFound: "見つかった", statPetReward: "謝礼金",
    typeLost: "😰 紛失しました", typeFound: "🔍 拾得しました", typePetLost: "😢 ペットが迷子です", typePetFound: "🔍 迷子ペットを見つけました",
    postTypeLabel: "投稿タイプ *",
    encourageTitle: "❤️ 見つかるたびに、良いニュースです", encourageDesc: "助けてくれた方に感謝します。",
    reportFound: "📢 発見を報告", reportFoundConfirm: "この物品/ペットが見つかったと思いますか？\n\n投稿者に確認通知を送信します。",
    reportFoundDone: "✅ 報告しました。投稿者に通知します。ありがとうございます！",
    expiredNotice: "🔴 この投稿は60日を超え、自動的に期限切れになりました",
    expiringSoon: "⏰ あと {days} 日で期限切れ",
    expiringHint: "見つかった場合は「✅ 見つかりました」をタップしてください",
    tut1: "What'sfindへようこそ", tut1d: "台湾初の不正受取防止・落とし物プラットフォーム。\n無料 · 安全 · リアルタイムチャット\n落とし物と迷子ペットを見つけましょう。",
    tut2: "ワンクリックで投稿", tut2d: "カテゴリを選択、説明を記入、写真をアップロード。\n52の国際空港とGPS対応。\n近くのユーザーがすぐに投稿を確認できます。",
    tut3: "不正受取防止認証", tut3d: "本当の持ち主だけが答えられる質問を設定。\n認証後のみ連絡先を表示。\n双方の署名付き引渡し記録を自動生成。",
    tut4: "みんなでペット捜索", tut4d: "ペットモードに切り替えて迷子ペットを投稿。\n犬、猫、鳥など多種対応。\nSNS共有で捜索範囲を拡大。",
    tut5: "セキュリティ保護", tut5d: "リンク自動マスク***、詐欺キーワード検出。\nチャットメッセージ通報可能。\n165詐欺対策ホットライン。",
    tut6: "リアルタイムチャット", tut6d: "認証後すぐにチャット可能。\nプッシュ通知で見逃しなし。\n引渡し後に相互評価。",
    tut7: "いつでもどこでも", tut7d: "ホーム画面に追加でアプリのように使用。\n4言語対応：中英日韓。\n完全無料。",
    announcement: "📢 お知らせ", newAnnouncement: "お知らせ登録", announcePlaceholder: "お知らせ内容を入力...",
    expired: "期限切れ", daysLeft: "日後に期限切れ", autoExpire: "この投稿は90日を超えました",
    reward: "💰 謝礼金", rewardPlaceholder: "金額を入力（任意）", rewardLabel: "謝礼金",
    petMode: "🐾 ペット", itemMode: "📦 遺失物", petLost: "🐾 行方不明", petFound: "✅ 見つかった", petReward: "謝礼金", myPetLost: "ペットが迷子です", foundPet: "迷子ペットを見つけました", petReminder: "ペット捜索の注意",
    location: "場所", selectLocation: "場所を選択", customLocation: "手入力", locationPlaceholder: "例：駅、コンビニ...",
  },
  ko: {
    appName: "What'sfind", subtitle: "사칭 방지 분실물 상호 도움 플랫폼",
    login: "로그인", logout: "로그아웃", welcomeTitle: "What'sfind에 오신 것을 환영합니다", welcomeDesc: "로그인 후 게시글을 작성하고 진행 상황을 추적하세요",
    googleLogin: "Google 계정으로 로그인", appleLogin: "Apple 계정으로 로그인", termsAgree: "로그인 시 이용약관 및 개인정보처리방침에 동의합니다",
    all: "전체", grpAirport: "공항 수하물", grpGeneral: "일반 분실", lost: "수하물 분실", wrong: "수하물 오인수취", delayed: "수하물 지연", damaged: "수하물 파손", found: "습득물", seeking: "분실물 찾기",
    wallet: "지갑", id_doc: "신분증", electronics: "전자기기", keys: "열쇠",
    allAirports: "모든 공항", allDates: "모든 날짜", search: "🔎 검색...",
    posts: "게시글", resolved: "회수 완료", noResults: "관련 게시글을 찾을 수 없습니다",
    publish: "＋ 게시", newPost: "새 게시글", cancel: "취소",
    type: "유형", airport: "공항", selectAirport: "공항 선택", nearestAirport: "📍 가까운 공항 선택",
    flight: "항공편 번호", flightPlaceholder: "예: CI-752", date: "날짜",
    title: "제목", titlePlaceholder: "분실 또는 습득 물품 설명",
    description: "상세 설명", descPlaceholder: "물품 특징 설명...",
    photos: "사진 (최대 3장)", upload: "업로드",
    verifyTitle: "사칭 방지 인증 질문", verifyDesc: "분실자만 답할 수 있는 질문을 설정하세요.",
    verifyQ: "인증 질문", addVerifyQ: "＋ 질문 추가", remove: "삭제", reselect: "← 다시 선택",
    answerPlaceholder: "정답 (본인만 확인 가능)",
    contact: "연락처", contactHidden: "연락처 숨김", contactHiddenDesc: "인증 후 연락처를 확인할 수 있습니다.",
    contactVisible: "인증 후 확인 가능", contactPlaceholder: "Line / Email / 전화",
    publishBtn: "📤 게시하기", publishSuccess: "게시 완료!",
    detail: "상세정보", resolved2: "회수 완료", shield: "사칭 방지 인증 보호 중",
    claimBtn: "🔑 본인 확인 신청", loginToClaim: "🔑 로그인 후 신청",
    pending: "심사 중", verified: "인증 완료!",
    chatWith: "💬 게시자와 채팅", chatRoom: "채팅방", startChat: "대화를 시작하세요!",
    send: "전송", typeMsg: "메시지 입력...",
    resolveBtn: "🎉 물품 찾았어요", resolveConfirm: "물품을 찾았나요?", confirm: "찾았습니다!",
    deleteBtn: "🗑️ 삭제", deleteConfirm: "이 게시글을 삭제하시겠습니까? 되돌릴 수 없습니다.",
    reportBtn: "🚩 신고", reportConfirm: "이 게시글을 신고하시겠습니까?", reportSent: "신고가 접수되었습니다.",
    adminDelete: "🗑️ 관리자 삭제", adminDeleteConfirm: "관리자 권한으로 삭제하시겠습니까?",
    claims: "인수 신청", approved: "승인됨", rejected: "거절됨", pendingReview: "심사 대기",
    approve: "✅ 승인", reject: "❌ 거절", chat: "💬 채팅",
    answer: "답변", question: "Q",
    submitClaim: "🔑 신청 제출", claimWarning: "허위 신청은 법적 처벌을 받을 수 있습니다.",
    yourAnswer: "답변", submit: "📤 제출",
    claimSuccess: "인증 완료!", claimSuccessDesc: "정답입니다! 연락처를 확인할 수 있습니다.",
    claimSent: "신청 완료", claimSentDesc: "심사 대기 중입니다.", ok: "확인",
    donateTitle: "☕ 축하합니다!", donateDesc: "플랫폼 운영을 위해 소액 후원을 부탁드립니다.",
    donate: "💚 후원", skipDonate: "다음에", custom: "직접 입력", thanks: "🙏 좋은 여행 되세요!", done: "완료",
    replies: "댓글", noReplies: "댓글 없음", replyPlaceholder: "댓글을 남기세요...",
    notifTitle: "알림 켜기", notifDesc: "누군가 신청하거나 댓글을 남기면 알려드립니다", notifOpen: "켜기",
    notifAddHome: "홈 화면에 추가", notifAddHomeDesc: "홈 화면에 추가하면 알림을 받을 수 있습니다", notifLearn: "자세히",
    notifEnabled: "🔔 알림 설정 완료",
    notifUnsupported: "이 브라우저는 알림을 지원하지 않습니다.",
    notifDenied: "알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.",
    warning: "⚠️ 중요 안내", warningText: "본 플랫폼은 정보 교류만 제공하며, 물품 보관이나 반환에 대한 책임을 지지 않습니다.",
    terms: "이용약관", privacy: "개인정보처리방침", contactUs: "문의하기",
    termsContent: "What'sfind는 분실물 상호 도움 플랫폼입니다. 이용자는 게시한 내용에 대해 법적 책임을 집니다.",
    privacyContent: "계정 정보와 물품 설명을 매칭 서비스를 위해 수집합니다. 연락처는 기본적으로 숨겨져 있으며 제3자에게 판매하지 않습니다.",
    copyright: "© 2026 What'sfind All Rights Reserved.",
    close: "닫기", back: "← 뒤로", loading: "로딩 중...", loginFirst: "먼저 로그인하세요", goLogin: "로그인",
    notifications: "알림", clearAll: "전체 삭제", noNotif: "알림이 없습니다",
    claimNotif: "인수 신청을 했습니다", verifyNotif: "인증을 통과했습니다", replyNotif: "댓글을 남겼습니다", chatNotif: "새 메시지를 보냈습니다",
    today: "오늘", yesterday: "어제", daysAgo: "일 전",
    handoverConfirm: "📦 인수 확인", handoverWait: "상대방 확인 대기 중", handoverDone: "✅ 양측 인수 확인 완료",
    handoverAsk: "물품이 성공적으로 인수되었나요?", ownerConfirmed: "분실자 확인", finderConfirmed: "습득자 확인",
    rateTitle: "⭐ 평가하기", rateDesc: "이번 도움 경험을 평가하세요", rateThanks: "평가해주셔서 감사합니다!",
    rateAvg: "평균 평점", rateCount: "회 평가",
    dashboard: "📊 관리 대시보드", totalPosts: "총 게시글", activePosts: "진행 중", resolvedPosts: "회수 완료", claimedReward: "수령 완료", supportUs: "What'sfind 후원",
    hiddenPosts: "숨김", resolveRate: "회수율", avgResponseTime: "평균 응답",
    announcement: "📢 공지", newAnnouncement: "공지 등록", announcePlaceholder: "공지 내용 입력...",
    expired: "만료됨", daysLeft: "일 후 만료", autoExpire: "이 게시글은 90일이 지났습니다",
    reward: "💰 사례금", rewardPlaceholder: "금액 입력 (선택)", rewardLabel: "사례금",
    petMode: "🐾 반려동물", itemMode: "📦 분실물", petLost: "🐾 실종", petFound: "✅ 발견", petReward: "사례금", myPetLost: "반려동물을 잃어버렸어요", foundPet: "잃어버린 반려동물을 발견했어요", petReminder: "반려동물 찾기 안내",
    location: "장소", selectLocation: "장소 선택", customLocation: "직접 입력", locationPlaceholder: "예: 서울역, 편의점...",
    tutorial1: "환영합니다", tutorial1d: "여행자를 위한 분실물 상호 도움 플랫폼입니다.",
    tutorial2: "분실물 게시", tutorial2d: "로그인 후 '＋ 게시'를 눌러 물품 정보를 작성하세요.",
    tutorial3: "사칭 방지 인증", tutorial3d: "본인만 답할 수 있는 질문을 설정하여 물품을 보호하세요.",
    tutorial4: "물품 인수", tutorial4d: "내 물건을 발견했나요? '본인 확인 신청'을 눌러 인증하세요.",
    tutorial5: "실시간 채팅", tutorial5d: "인증 후 상대방과 직접 채팅하여 반환을 진행하세요.",
    tutorial6: "실시간 알림", tutorial6d: "알림을 켜면 신청이나 댓글이 올 때 바로 알려드립니다.",
    skip: "건너뛰기", next: "다음", start: "시작하기 🚀",
    other: "기타", customAirport: "공항명 입력",
    nearbyKm: "반경 {km}km 이내", nearbyLatest: "최근 게시물", nearbyPet: "근처 수색 중", seeMore: "더보기 →",
    statSearching: "수색 중", statFound: "발견됨", statReward: "사례금", statPetLost: "실종 중", statPetFound: "발견됨", statPetReward: "사례금",
    typeLost: "😰 분실했어요", typeFound: "🔍 주웠어요", typePetLost: "😢 반려동물을 잃어버렸어요", typePetFound: "🔍 유기동물을 발견했어요",
    postTypeLabel: "게시 유형 *",
    encourageTitle: "❤️ 되찾을 때마다 좋은 소식입니다", encourageDesc: "도와주신 분께 감사드립니다.",
    reportFound: "📢 발견 신고", reportFoundConfirm: "이 물품/반려동물이 발견되었다고 생각하시나요?\n\n게시자에게 확인 알림을 보냅니다.",
    reportFoundDone: "✅ 신고 완료! 게시자에게 알림을 보냅니다. 감사합니다!",
    expiredNotice: "🔴 이 게시물은 60일이 지나 자동 만료되었습니다",
    expiringSoon: "⏰ {days}일 후 자동 만료",
    expiringHint: "찾았다면 '✅ 찾았어요'를 눌러주세요",
    tut1: "What'sfind에 오신 것을 환영합니다", tut1d: "대만 최초 사기 방지 분실물 플랫폼.\n무료 · 안전 · 실시간 채팅\n분실물과 실종 반려동물을 찾아보세요.",
    tut2: "원클릭 게시", tut2d: "카테고리 선택, 설명 작성, 사진 업로드.\n52개 국제공항 및 GPS 지원.\n근처 사용자가 즉시 게시물을 확인합니다.",
    tut3: "사기 방지 인증", tut3d: "진짜 소유자만 답할 수 있는 질문 설정.\n인증 후에만 연락처 표시.\n양측 서명이 포함된 인수인계 기록.",
    tut4: "반려동물 전국 수색", tut4d: "반려동물 모드로 전환하여 실종/발견 게시.\n개, 고양이, 새 등 다양한 동물 지원.\nSNS 공유로 수색 범위 확대.",
    tut5: "보안 보호", tut5d: "링크 자동 마스킹***, 사기 키워드 감지.\n채팅 메시지 신고 가능.\n165 사기 방지 핫라인.",
    tut6: "실시간 채팅 및 알림", tut6d: "인증 후 바로 채팅 가능.\n푸시 알림으로 놓치지 마세요.\n인수인계 후 상호 평가.",
    tut7: "언제 어디서나", tut7d: "홈 화면에 추가하여 앱처럼 사용.\n4개 언어 지원: 중영일한.\n완전 무료.",
  },
};

const AIRPORTS_DATA = [
  // 台灣
  { name: "桃園國際機場 (TPE)", lat: 25.0797, lng: 121.2342 },
  { name: "高雄國際機場 (KHH)", lat: 22.5771, lng: 120.3500 },
  { name: "台中清泉崗機場 (RMQ)", lat: 24.2647, lng: 120.6210 },
  { name: "松山機場 (TSA)", lat: 25.0694, lng: 121.5525 },
  { name: "花蓮機場 (HUN)", lat: 24.0231, lng: 121.6183 },
  { name: "台東機場 (TTT)", lat: 22.7550, lng: 121.1018 },
  // 日本
  { name: "東京成田 (NRT)", lat: 35.7647, lng: 140.3864 },
  { name: "東京羽田 (HND)", lat: 35.5494, lng: 139.7798 },
  { name: "大阪關西 (KIX)", lat: 34.4347, lng: 135.2440 },
  { name: "名古屋中部 (NGO)", lat: 34.8584, lng: 136.8125 },
  { name: "福岡 (FUK)", lat: 33.5859, lng: 130.4511 },
  { name: "札幌新千歲 (CTS)", lat: 42.7752, lng: 141.6925 },
  { name: "沖繩那霸 (OKA)", lat: 26.1958, lng: 127.6459 },
  // 韓國
  { name: "首爾仁川 (ICN)", lat: 37.4602, lng: 126.4407 },
  { name: "首爾金浦 (GMP)", lat: 37.5583, lng: 126.7906 },
  { name: "釜山金海 (PUS)", lat: 35.1796, lng: 128.9382 },
  { name: "濟州 (CJU)", lat: 33.5113, lng: 126.4929 },
  // 東南亞
  { name: "曼谷素萬那普 (BKK)", lat: 13.6900, lng: 100.7501 },
  { name: "曼谷廊曼 (DMK)", lat: 13.9126, lng: 100.6068 },
  { name: "清邁 (CNX)", lat: 18.7669, lng: 98.9625 },
  { name: "新加坡樟宜 (SIN)", lat: 1.3644, lng: 103.9915 },
  { name: "吉隆坡 (KUL)", lat: 2.7456, lng: 101.7099 },
  { name: "峇里島 (DPS)", lat: -8.7482, lng: 115.1672 },
  { name: "雅加達 (CGK)", lat: -6.1256, lng: 106.6558 },
  { name: "胡志明市 (SGN)", lat: 10.8188, lng: 106.6520 },
  { name: "河內 (HAN)", lat: 21.2212, lng: 105.8070 },
  { name: "峴港 (DAD)", lat: 16.0439, lng: 108.1992 },
  { name: "馬尼拉 (MNL)", lat: 14.5086, lng: 121.0198 },
  { name: "宿霧 (CEB)", lat: 10.3075, lng: 123.9794 },
  { name: "金邊 (PNH)", lat: 11.5466, lng: 104.8440 },
  { name: "暹粒 (REP)", lat: 13.4107, lng: 103.8130 },
  // 港澳中國
  { name: "香港赤鱲角 (HKG)", lat: 22.3080, lng: 113.9185 },
  { name: "澳門 (MFM)", lat: 22.1496, lng: 113.5916 },
  { name: "上海浦東 (PVG)", lat: 31.1443, lng: 121.8083 },
  { name: "北京大興 (PKX)", lat: 39.5098, lng: 116.4105 },
  { name: "廣州白雲 (CAN)", lat: 23.3924, lng: 113.2988 },
  { name: "廈門高崎 (XMN)", lat: 24.5440, lng: 118.1277 },
  // 美洲
  { name: "洛杉磯 (LAX)", lat: 33.9416, lng: -118.4085 },
  { name: "舊金山 (SFO)", lat: 37.6213, lng: -122.3790 },
  { name: "紐約乘甘迺迪 (JFK)", lat: 40.6413, lng: -73.7781 },
  { name: "溫哥華 (YVR)", lat: 49.1967, lng: -123.1815 },
  // 歐洲
  { name: "倫敦希斯洛 (LHR)", lat: 51.4700, lng: -0.4543 },
  { name: "巴黎戴高樂 (CDG)", lat: 49.0097, lng: 2.5479 },
  { name: "法蘭克福 (FRA)", lat: 50.0379, lng: 8.5622 },
  { name: "阿姆斯特丹 (AMS)", lat: 52.3105, lng: 4.7683 },
  { name: "羅馬 (FCO)", lat: 41.8003, lng: 12.2389 },
  // 大洋洲
  { name: "雪梨 (SYD)", lat: -33.9461, lng: 151.1772 },
  { name: "墨爾本 (MEL)", lat: -37.6733, lng: 144.8433 },
  { name: "奧克蘭 (AKL)", lat: -37.0082, lng: 174.7850 },
];

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
const DEFAULT_CATEGORIES = [
  { id: "lost", labelKey: "lost", icon: "🧳", img: "/cat-luggage.png", color: "#E05A33", mode: "item" },
  { id: "wrong", labelKey: "wrong", icon: "🔄", img: "/cat-wrong.png", color: "#D4880F", mode: "item" },
  { id: "found", labelKey: "found", icon: "🔍", img: "/cat-found.png", color: "#2D8A5E", mode: "item" },
  { id: "seeking", labelKey: "seeking", icon: "🔎", img: "/cat-seeking.png", color: "#1B4965", mode: "item" },
  { id: "wallet", labelKey: "wallet", icon: "👛", img: "/cat-wallet.png", color: "#C2185B", mode: "item" },
  { id: "id_doc", labelKey: "id_doc", icon: "📇", img: "/cat-id-doc.png", color: "#00838F", mode: "item" },
  { id: "electronics", labelKey: "electronics", icon: "📱", img: "/cat-electronics.png", color: "#5D4037", mode: "item" },
  { id: "keys", labelKey: "keys", icon: "🔑", img: "/cat-keys.png", color: "#795548", mode: "item" },
  { id: "pet_dog", icon: "🐕", img: "/cat-pet-dog.png", color: "#8D6E63", mode: "pet", labels: { zh: "狗", en: "Dog", ja: "犬", ko: "개" } },
  { id: "pet_cat", icon: "🐈", img: "/cat-pet-cat.png", color: "#7B4BB2", mode: "pet", labels: { zh: "貓", en: "Cat", ja: "猫", ko: "고양이" } },
  { id: "pet_bird", icon: "🐦", img: "/cat-pet-bird.png", color: "#00838F", mode: "pet", labels: { zh: "鳥", en: "Bird", ja: "鳥", ko: "새" } },
  { id: "pet_other", icon: "🐾", img: "/cat-pet-paw.png", color: "#5D4037", mode: "pet", labels: { zh: "其他寵物", en: "Other pet", ja: "その他", ko: "기타" } },
];
const ITEM_CATS = DEFAULT_CATEGORIES.filter(c => c.mode === "item").map(c => c.id);
const PET_CATS = DEFAULT_CATEGORIES.filter(c => c.mode === "pet").map(c => c.id);
const ADMIN_UIDS_LIST = ["W341jlLPt8OYy78lp9RTqnDuUiK2"];
const CATEGORY_COLORS = ["#E05A33", "#D4880F", "#2D8A5E", "#7B4BB2", "#1B4965", "#C2185B", "#00838F", "#5D4037"];
const CATEGORY_ICONS = ["🧳", "🔄", "🔍", "📇", "📱", "💼", "🎒", "👜", "💻", "🔑", "👛", "📷", "🐕", "🐈", "🐦", "🐾"];
const DEFAULT_VERIFY_HINTS = {
  lost: ["行李條號碼？", "出發或抵達的航點代碼？", "行李箱內有什麼特殊物品？", "箱子密碼鎖的號碼？", "行李吊牌的內容？"],
  wrong: ["你原本行李箱的顏色品牌？", "行李條號碼？", "箱內有什麼特殊物品？"],
  found: ["物品的顏色或外觀特徵？", "物品內有什麼東西？", "在哪裡遺失的？"],
  seeking: ["物品的品牌型號？", "物品的顏色？", "遺失時間和地點？"],
  wallet: ["錢包的品牌或顏色？", "裡面有什麼卡片？", "大約有多少現金？"],
  id_doc: ["證件上的姓名？", "證件種類（身分證/護照/駕照）？", "證件號碼後四碼？"],
  electronics: ["裝置的品牌型號？", "裝置的顏色？", "有沒有保護殼？", "螢幕鎖密碼提示？"],
  keys: ["鑰匙圈的樣式？", "有幾把鑰匙？", "有沒有特殊吊飾？"],
  pet_dog: ["品種？", "毛色和花紋？", "有沒有項圈或晶片？", "名字叫什麼？", "體型大小？"],
  pet_cat: ["品種？", "毛色和花紋？", "有沒有項圈或晶片？", "名字叫什麼？", "左右耳有沒有剪耳？"],
  pet_bird: ["品種？", "羽毛顏色？", "有沒有腳環？", "會不會說話？"],
  pet_other: ["動物種類？", "外觀特徵？", "有沒有識別標記？", "名字叫什麼？"],
  _default: ["物品的特徵描述？", "在哪裡遺失的？", "物品內有什麼東西？"],
};
const DONATE_AMOUNTS = [30, 50, 100, 200, 500];
const DEFAULT_REWARD_AMOUNTS = [100, 200, 500, 1000, 2000];

function timeAgo(dateStr, t) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return t.today;
  if (diff === 1) return t.yesterday;
  return diff + " " + t.daysAgo;
}
function AvatarCircle({ name, avatar, size = 36 }) {
  if (avatar) return <img src={avatar} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const colors = ["#1B4965", "#2D8A5E", "#D4880F", "#7B4BB2", "#E05A33"];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[(name || "A").charCodeAt(0) % colors.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {(name || "?").slice(-1)}
    </div>
  );
}
function GoogleIcon() {
  return (<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>);
}

function AdBanner({ style }) {
  const adRef = useRef(null);
  useEffect(() => {
    try { if (adRef.current && !adRef.current.dataset.loaded) { (window.adsbygoogle = window.adsbygoogle || []).push({}); adRef.current.dataset.loaded = "1"; } } catch(e) {}
  }, []);
  return (
    <div style={{ textAlign: "center", margin: "10px 16px", overflow: "hidden", borderRadius: 12, minHeight: 50, ...style }}>
      <ins className="adsbygoogle" ref={adRef} style={{ display: "block" }} data-ad-client="ca-pub-2995011881201839" data-ad-slot="7526027953" data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

export default function App() {
  // ─── Auth ───
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lf_lang") || "zh"; } catch { return "zh"; }
  });
  const t = T[lang] || T.zh;
  function switchLang(l) { setLang(l); try { localStorage.setItem("lf_lang", l); } catch {} }
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [isReferred, setIsReferred] = useState(false);
  const [savedClaimedReward, setSavedClaimedReward] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedAirports, setSortedAirports] = useState(AIRPORTS_DATA.map(a => a.name));

  // Get user location and sort airports by distance
  useEffect(() => {
    // Listen for saved claimed rewards (from deleted posts)
    const unsubRewards = onSnapshot(doc(db, "stats", "claimedRewards"), (snap) => {
      if (snap.exists()) setSavedClaimedReward(snap.data().total || 0);
    });
    if (!navigator.geolocation) return () => unsubRewards();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const sorted = [...AIRPORTS_DATA]
          .map(a => ({ ...a, dist: getDistance(latitude, longitude, a.lat, a.lng) }))
          .sort((a, b) => a.dist - b.dist);
        setSortedAirports(sorted.map(a => a.name));
      },
      () => {} // silently fail
    );
    return () => unsubRewards();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser({ uid: u.uid, name: u.displayName || u.email.split("@")[0], email: u.email, avatar: u.photoURL, provider: u.providerData[0]?.providerId });
        // Generate referral code from UID
        const code = u.uid.substring(0, 8).toUpperCase();
        setReferralCode(code);
        // Real-time listener for referral data
        onSnapshot(doc(db, "referrals", u.uid), (snap) => {
          if (snap.exists()) {
            setReferralCount(snap.data().count || 0);
            setIsReferred(!!snap.data().referredBy);
          }
        }, () => {});
        try {
          const refDoc = await getDoc(doc(db, "referrals", u.uid));
          // Check if user has referral code from URL
          const urlRef = new URLSearchParams(window.location.search).get("ref");
          if (urlRef) {
            const alreadyReferred = refDoc.exists() && refDoc.data().referredBy;
            if (!alreadyReferred) {
              let referrerUid = null;
              const allRefs = await getDocs(collection(db, "referrals"));
              allRefs.forEach(d => {
                const docCode = d.id.substring(0, 8).toUpperCase();
                const savedCode = (d.data().code || "").toUpperCase();
                if (docCode === urlRef.toUpperCase() || savedCode === urlRef.toUpperCase()) referrerUid = d.id;
              });
              if (referrerUid && referrerUid !== u.uid) {
                // Give referred user 1 free pin
                await setDoc(doc(db, "referrals", u.uid), { code, referredBy: referrerUid, count: (refDoc.exists() ? (refDoc.data().count || 0) : 0) + 1, createdAt: serverTimestamp() }, { merge: true });
                // Give referrer +1 pin
                await updateDoc(doc(db, "referrals", referrerUid), { count: increment(1) }).catch(async () => {
                  await setDoc(doc(db, "referrals", referrerUid), { count: 1 }, { merge: true });
                });
                window.history.replaceState({}, "", window.location.pathname);
              } else if (!refDoc.exists()) {
                await setDoc(doc(db, "referrals", u.uid), { code, count: 0, createdAt: serverTimestamp() });
              }
            }
            window.history.replaceState({}, "", window.location.pathname);
          } else if (!refDoc.exists()) {
            await setDoc(doc(db, "referrals", u.uid), { code, count: 0, createdAt: serverTimestamp() });
          }
        } catch(e) { console.error("Referral error:", e); }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  async function handleGoogleLogin() {
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, googleProvider);
      setView("feed");
    } catch (e) {
      console.error("Google login error:", e);
      // If popup blocked (common in PWA), try redirect
      if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request") {
        try {
          const { signInWithRedirect } = await import("firebase/auth");
          await signInWithRedirect(auth, googleProvider);
        } catch (e2) {
          alert("登入失敗，請在 Safari 開啟此網站登入後再加入主畫面");
        }
      } else {
        alert("登入失敗，請再試一次");
      }
    }
  }
  async function handleAppleLogin() {
    try {
      const appleProvider = new OAuthProvider("apple.com");
      appleProvider.addScope("email");
      appleProvider.addScope("name");
      await signInWithPopup(auth, appleProvider);
      setView("feed");
    } catch (e) { console.error("Apple login error:", e); alert("Apple 登入失敗，請再試一次"); }
  }
  async function handleLogout() {
    await signOut(auth);
    setShowMenu(false); setView("feed");
  }

  // ─── Firestore: Posts ───
  const [posts, setPosts] = useState([]);
  const [pullRefresh, setPullRefresh] = useState(false);
  const pullStartY = useRef(0);
  const pullDist = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(0);

  function handlePullStart(e) {
    if (window.scrollY === 0) pullStartY.current = e.touches[0].clientY;
    else pullStartY.current = 0;
  }
  function handlePullMove(e) {
    if (!pullStartY.current) return;
    pullDist.current = e.touches[0].clientY - pullStartY.current;
    if (pullDist.current > 0 && pullDist.current < 150) setPullIndicator(pullDist.current);
  }
  function handlePullEnd() {
    if (pullDist.current > 80) {
      setPullRefresh(true);
      setPullIndicator(0);
      window.location.reload();
    } else {
      setPullIndicator(0);
    }
    pullStartY.current = 0;
    pullDist.current = 0;
  }
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(prev => {
        // Only update if data actually changed (prevent unnecessary re-renders)
        if (prev.length === data.length && prev.every((p, i) => p.id === data[i]?.id && p.resolved === data[i]?.resolved && p.hidden === data[i]?.hidden && p.pinned === data[i]?.pinned)) return prev;
        return data;
      });
      setPostsLoading(false);
    });
    return unsub;
  }, []);

  // Auto-cleanup expired photos (15 days) & resolved posts (30 days) - runs once on login
  useEffect(() => {
    if (!user || posts.length === 0) return;
    posts.forEach(p => {
      // Cleanup expired photos
      if (p.photos?.length > 0 && p.photosUploadedAt) {
        const daysSince = (new Date() - new Date(p.photosUploadedAt)) / 86400000;
        if (daysSince > 15) {
          updateDoc(doc(db, "posts", p.id), {
            photos: [], photosUploadedAt: null
          }).catch(() => {});
        }
      }
      // Auto-delete resolved posts after 30 days
      if (p.resolved && p.resolvedAt) {
        const resolvedDate = p.resolvedAt?.toDate?.() || (p.resolvedAt?.seconds ? new Date(p.resolvedAt.seconds * 1000) : new Date(p.resolvedAt));
        const daysSinceResolved = (new Date() - resolvedDate) / 86400000;
        if (daysSinceResolved > 30) {
          saveClaimedReward(p.id).then(() => {
            deleteDoc(doc(db, "posts", p.id)).catch(() => {});
          });
        }
      }
    });
  }, [user?.uid, postsLoading]);

  // Sync selectedPost with real-time posts updates
  useEffect(() => {
    if (selectedPost) {
      const fresh = posts.find(p => p.id === selectedPost.id);
      if (fresh) setSelectedPost(fresh);
    }
  }, [posts]);

  const currentChatRoomRef = useRef(null);

  // ─── Firestore notification listener ───
  useEffect(() => {
    if (!user) return;
    // Simple query without orderBy to avoid composite index requirement
    const q = query(
      collection(db, "userNotifs"),
      where("targetUid", "==", user.uid),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === "added") {
          const d = change.doc.data();
          // Skip chat notification if currently in that chat room
          if (d.type === "chat" && d.roomId && currentChatRoomRef.current === d.roomId) {
            updateDoc(change.doc.ref, { read: true }).catch(() => {});
            return;
          }
          const notif = {
            id: change.doc.id,
            type: d.type,
            postId: d.postId,
            postTitle: d.postTitle,
            from: d.from,
            roomId: d.roomId || null,
            targetUid: d.targetUidSender || null,
            targetName: d.from,
            time: d.createdAt?.toDate?.()?.toLocaleString("zh-TW") || "剛剛",
          };
          setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });
          // Auto-add chat room to activeChats if it's a chat notification
          if (d.type === "chat" && d.roomId && d.targetUidSender) {
            setActiveChats(prev => {
              if (prev.some(c => c.roomId === d.roomId)) {
                return prev.map(c => c.roomId === d.roomId ? { ...c, lastMsg: d.postTitle || "", lastMsgAt: Date.now(), unread: (c.unread || 0) + 1 } : c);
              }
              return [...prev, { roomId: d.roomId, postId: d.postId, targetUid: d.targetUidSender, targetName: d.from, targetAvatar: null, lastMsg: d.postTitle || "", lastMsgAt: Date.now(), unread: 1, msgCount: 0 }];
            });
          }
          // Browser push
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            let body;
            if (d.type === "claim") body = d.from + " " + t.claimNotif + "「" + d.postTitle + "」";
            else if (d.type === "chat") body = d.from + "：" + d.postTitle;
            else body = d.from + " " + t.replyNotif + "「" + d.postTitle + "」";
            const n = new Notification(t.appName, { body });
            n.onclick = () => window.focus();
          }
          // Don't auto-mark as read - user will clear manually
        }
      });
    }, (err) => { console.error("Notification listener error:", err); });
    return unsub;
  }, [user?.uid]);

  // Notification permission
  const notifSupported = typeof Notification !== "undefined";
  const [notifPermission, setNotifPermission] = useState(
    notifSupported ? Notification.permission : "unsupported"
  );

  async function requestNotifPermission() {
    if (!notifSupported) {
      alert("您的瀏覽器不支援通知功能。\n\niPhone 用戶請：\n1. 點下方「分享」按鈕（方框+箭頭）\n2. 選「加入主畫面」\n3. 從主畫面開啟網站\n即可收到通知。");
      return;
    }
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      new Notification("What'sfind", { body: "通知已開啟！有新訊息會即時提醒您。", icon: "/icon-192.png" });
      // Register FCM token
      try {
        const messaging = getMessaging();
        const token = await getToken(messaging, { vapidKey: "BCim8ba3qozEMDrtosCbrYlYPtJzo-Iqa31dEk7oWx14NHV5e6Cp7FTtffeiJTMsD-8LxR1LatVqnGc84bairEE", serviceWorkerRegistration: await navigator.serviceWorker.ready });
        if (token && user) {
          await setDoc(doc(db, "fcmTokens", user.uid), { token, updatedAt: serverTimestamp() }, { merge: true });
        }
      } catch(e) { /* FCM skipped */ }
    } else if (result === "denied") {
      alert("通知已被封鎖。\n\n請到瀏覽器設定 → 網站設定 → 通知 → 允許此網站。");
    }
  }

  // FCM foreground message handler
  useEffect(() => {
    if (!user || notifPermission !== "granted") return;
    try {
      const messaging = getMessaging();
      const unsub = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (title) new Notification(title, { body, icon: "/icon-192.png" });
      });
      return unsub;
    } catch(e) {}
  }, [user, notifPermission]);

  // ─── Firestore: Chat messages (real-time) ───
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  function subscribeToChatRoom(roomId) {
    if (!roomId) return () => {};
    const q = query(collection(db, "chats", roomId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }

  // ─── UI States ───
  const [view, setView] = useState("feed");
  const [feedMode, setFeedMode] = useState("list");
  const [catGroup, setCatGroup] = useState("all");
  const [rewardFilter, setRewardFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [showSearch, setShowSearch] = useState(false); // "all", "active", "resolved"
  const AIRPORT_CATS = ["lost", "wrong"];
  const GENERAL_CATS = ["found", "seeking", "wallet", "id_doc", "electronics", "keys"];
  const [bottomTab, setBottomTab] = useState("home"); // "home", "myitems", "post", "messages", "profile"
  const [filter, setFilter] = useState("all");
  const [airportFilter, setAirportFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [showCatEditor, setShowCatEditor] = useState(false);
  const [editCats, setEditCats] = useState([]);
  const [catEditorMode, setCatEditorMode] = useState("item");
  const [editingCatIdx, setEditingCatIdx] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifCount, setReadNotifCount] = useState(0);
  const prevPostsRef = useRef(null);
  const unreadCount = Math.max(0, notifications.length - readNotifCount);

  // Profile
  const [userRatings, setUserRatings] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Form
  const [formCat, setFormCat] = useState("");
  const [formCatGroup, setFormCatGroup] = useState("airport");
  const [editingPost, setEditingPost] = useState(null);
  const [formAirport, setFormAirport] = useState("");
  const [formCustomAirport, setFormCustomAirport] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  // Pet-specific fields
  const [formPetName, setFormPetName] = useState("");
  const [formPetGender, setFormPetGender] = useState("");
  const [formPetBreed, setFormPetBreed] = useState("");
  const [formPetColor, setFormPetColor] = useState("");
  const [formPetFeature, setFormPetFeature] = useState("");
  const [formPetChip, setFormPetChip] = useState("");
  const [formPetAge, setFormPetAge] = useState("");
  const [formPetSize, setFormPetSize] = useState("");
  const [formPetSubType, setFormPetSubType] = useState("");
  const [showPetSuccessTips, setShowPetSuccessTips] = useState(false);
  const [formPetLine, setFormPetLine] = useState("");
  const [formPetPhone, setFormPetPhone] = useState("");
  const [formPetSkipVerify, setFormPetSkipVerify] = useState(false);

  // ─── Traffic & Quota Management ───
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [showQueuePage, setShowQueuePage] = useState(false);
  const [firestoreErrors, setFirestoreErrors] = useState(0);
  const firestoreErrorRef = useRef(0);

  function handleFirestoreError(e) {
    const msg = e?.message || e?.code || "";
    if (msg.includes("quota") || msg.includes("resource-exhausted") || msg.includes("RESOURCE_EXHAUSTED")) {
      firestoreErrorRef.current += 1;
      setFirestoreErrors(firestoreErrorRef.current);
      if (firestoreErrorRef.current >= 3 && !readOnlyMode) {
        setReadOnlyMode(true);
        alert("⚠️ 系統流量過大，已切換為唯讀模式。\n\n目前只能瀏覽，暫時無法發文或聊天。\n請稍後再試。");
      }
      if (firestoreErrorRef.current >= 10) {
        setShowQueuePage(true);
      }
    }
    if (msg.includes("unavailable") || msg.includes("deadline-exceeded")) {
      firestoreErrorRef.current += 2;
      setFirestoreErrors(firestoreErrorRef.current);
      if (firestoreErrorRef.current >= 6) {
        setShowQueuePage(true);
      }
    }
  }

  // Auto-recover: check every 30s
  useEffect(() => {
    if (!readOnlyMode && !showQueuePage) return;
    const timer = setInterval(() => {
      firestoreErrorRef.current = Math.max(0, firestoreErrorRef.current - 1);
      setFirestoreErrors(firestoreErrorRef.current);
      if (firestoreErrorRef.current <= 0) {
        setReadOnlyMode(false);
        setShowQueuePage(false);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [readOnlyMode, showQueuePage]);
  const [formContact, setFormContact] = useState("");
  const [formContactType, setFormContactType] = useState("line");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const [showPostGuide, setShowPostGuide] = useState(false);
  const [formFlight, setFormFlight] = useState("");
  const [formReward, setFormReward] = useState("");
  const [formWrongType, setFormWrongType] = useState("");
  const [formPostType, setFormPostType] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formPhotos, setFormPhotos] = useState([]);
  const [formLocation, setFormLocation] = useState(null); // { lat, lng }
  const [formLocationText, setFormLocationText] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const photoInputRef = useRef(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formVerifyQs, setFormVerifyQs] = useState([{ q: "", a: "", custom: false }]);
  const [submitted, setSubmitted] = useState(false);

  // Claim
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimAnswers, setClaimAnswers] = useState([]);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimAutoApproved, setClaimAutoApproved] = useState(false);
  const [postClaims, setPostClaims] = useState([]);
  const [approvedContact, setApprovedContact] = useState(null);
  const [ownerContact, setOwnerContact] = useState(null);

  // Chat
  const [chatTarget, setChatTarget] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [activeChats, setActiveChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lf_activeChats") || "[]"); } catch { return []; }
  });
  const [showChatList, setShowChatList] = useState(false);

  // Persist activeChats to localStorage
  useEffect(() => {
    try { localStorage.setItem("lf_activeChats", JSON.stringify(activeChats.map(c => ({ ...c, unread: 0 })))); } catch {}
  }, [activeChats]);

  // Resolve & Donate
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveStep, setResolveStep] = useState("confirm");
  const [donateAmount, setDonateAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  // ─── Dynamic categories ───
  const [customCategories, setCustomCategories] = useState(null);
  const [rewardAmounts, setRewardAmounts] = useState(DEFAULT_REWARD_AMOUNTS);
  const [rewardCats, setRewardCats] = useState(["lost", "seeking"]);
  const [rewardDirty, setRewardDirty] = useState(false);
  const [verifyHints, setVerifyHints] = useState(DEFAULT_VERIFY_HINTS);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "categories"), (snap) => {
      if (snap.exists() && Array.isArray(snap.data().list)) {
        setCustomCategories(snap.data().list);
      }
    }, () => {});
    const unsub2 = onSnapshot(doc(db, "config", "rewards"), (snap) => {
      if (snap.exists() && !rewardDirty) {
        if (Array.isArray(snap.data().amounts)) setRewardAmounts(snap.data().amounts);
        if (Array.isArray(snap.data().enabledCats)) setRewardCats(snap.data().enabledCats);
      }
    }, () => {});
    const unsub3 = onSnapshot(doc(db, "config", "verifyHints"), (snap) => {
      if (snap.exists()) setVerifyHints({ ...DEFAULT_VERIFY_HINTS, ...snap.data() });
    }, () => {});
    const unsub4 = onSnapshot(doc(db, "config", "ads"), (snap) => {
      if (snap.exists()) setShowHomeAds(snap.data().showHomeAds || false);
    }, () => {});
    return () => { unsub(); unsub2(); unsub3(); unsub4(); };
  }, []);
  const CATEGORIES = customCategories 
    ? [...customCategories.map(cc => {
        const def = DEFAULT_CATEGORIES.find(d => d.id === cc.id);
        return def?.img && !cc.img ? { ...cc, img: def.img } : cc;
      }), ...DEFAULT_CATEGORIES.filter(c => c.mode === "pet" && !customCategories.some(cc => cc.id === c.id))]
    : DEFAULT_CATEGORIES;
  const catLabel = (c) => c.labelKey ? t[c.labelKey] : (c.labels?.[lang] || c.labels?.zh || c.label || "");
  const catInfo = (id) => CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[0];
  const isOwner = (p) => user && p.authorUid === user.uid;
  // Admin UIDs - add your Google UID here
  // ─── Security: Input sanitization ───
  function sanitize(text) {
    if (!text) return "";
    return text.replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      .replace(/<[^>]*on\w+=[^>]*>/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  // Honeypot spam trap
  const [honeypot, setHoneypot] = useState("");

  // ─── Click sound ───
  function playClick() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = "sine";
      gain.gain.value = 0.03;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch(e) {}
  }

  useEffect(() => {
    function handleClick(e) {
      if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
        playClick();
      }
    }
    document.addEventListener("touchstart", handleClick, { passive: true });
    return () => document.removeEventListener("touchstart", handleClick);
  }, []);

  const [dynamicAdmins, setDynamicAdmins] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "admins"), (snap) => {
      if (snap.exists()) setDynamicAdmins(snap.data().list || []);
    }, () => {});
    return unsub;
  }, []);
  const ADMIN_UIDS = [...ADMIN_UIDS_LIST, ...dynamicAdmins];
  const isRealAdmin = user && ADMIN_UIDS.includes(user.uid);
  const [adminMode, setAdminMode] = useState(true);
  const [desktopWide, setDesktopWide] = useState(false);
  const [appMode, setAppMode] = useState("item");

  // Dynamic page title for SEO
  useEffect(() => {
    const titles = {
      feed: appMode === "pet" ? "What'sfind - 走失寵物協尋" : "What'sfind - 遺失物互助平台",
      post: "發佈貼文 - What'sfind",
      profile: "個人頁面 - What'sfind",
      chat: chatTarget ? chatTarget.name + " - What'sfind" : "聊天 - What'sfind",
      detail: selectedPost ? selectedPost.title + " - What'sfind" : "What'sfind",
      login: "登入 - What'sfind",
    };
    document.title = titles[view] || "What'sfind";
  }, [view, appMode, selectedPost?.title, chatTarget?.name]);
  const isAdmin = isRealAdmin && adminMode;

  // ─── Blocked users ───
  const [blockedUsers, setBlockedUsers] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "blockedUsers"), (snap) => {
      if (snap.exists()) setBlockedUsers(snap.data().list || []);
    }, () => {});
    return unsub;
  }, []);
  const isBlocked = user && blockedUsers.some(b => b.uid === user.uid);

  async function blockUser(uid, name) {
    if (!confirm("封鎖 " + name + "？此用戶將無法發文和認領。")) return;
    const updated = [...blockedUsers, { uid, name, blockedAt: new Date().toISOString(), blockedBy: user.name }];
    await setDoc(doc(db, "config", "blockedUsers"), { list: updated });
    await logAdminAction("block_user", { targetUid: uid, targetName: name });
  }

  async function unblockUser(uid) {
    const updated = blockedUsers.filter(b => b.uid !== uid);
    await setDoc(doc(db, "config", "blockedUsers"), { list: updated });
    await logAdminAction("unblock_user", { targetUid: uid });
  }

  // ─── Admin audit log ───
  async function logAdminAction(action, details = {}) {
    try {
      await addDoc(collection(db, "adminLogs"), {
        action, details, adminUid: user.uid, adminName: user.name,
        createdAt: serverTimestamp(),
      });
    } catch {}
  }

  const [adminLogs, setAdminLogs] = useState([]);
  const [showAdminLogs, setShowAdminLogs] = useState(false);
  const [contactMsgs, setContactMsgs] = useState([]);
  const [showContactMsgs, setShowContactMsgs] = useState(false);
  const [reportsList, setReportsList] = useState([]);

  async function loadAdminLogs() {
    const snap = await getDocs(query(collection(db, "adminLogs"), orderBy("createdAt", "desc")));
    setAdminLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setShowAdminLogs(true);
  }

  // ─── Rate limiting ───
  const DAILY_POST_LIMIT = 5;
  const DAILY_CLAIM_LIMIT = 10;

  function checkRateLimit(type) {
    if (!user) return false;
    if (isAdmin) return true;
    const key = "lf_rate_" + user.uid + "_" + type + "_" + new Date().toISOString().slice(0, 10);
    const count = parseInt(localStorage.getItem(key) || "0");
    const limit = type === "post" ? DAILY_POST_LIMIT : DAILY_CLAIM_LIMIT;
    if (count >= limit) { alert("今日" + (type === "post" ? "發文" : "認領") + "已達上限（" + limit + " 次）"); return false; }
    localStorage.setItem(key, String(count + 1));
    return true;
  }

  // ─── Sensitive content filter ───
  const BAD_WORDS = ["詐騙","色情","賭博","毒品","槍","殺"];
  function containsBadWords(text) {
    return BAD_WORDS.some(w => text.includes(w));
  }

  // ─── CSV Export ───
  function exportCSV() {
    var csvContent = "\uFEFF" + "ID,類別,標題,機場,日期,發文者,已尋回,已隱藏\n";
    posts.forEach(function(p) {
      var title = (p.title || "").replace(/,/g, " ");
      csvContent += p.id + "," + p.category + "," + title + "," + p.airport + "," + p.date + "," + p.authorName + "," + (p.resolved ? "是" : "否") + "," + (p.hidden ? "是" : "否") + "\n";
    });
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lostfound_" + new Date().toISOString().slice(0, 10) + ".csv";
    link.click();
  }

  async function reportPost(postId) {
    const reason = prompt("請說明檢舉原因：");
    if (!reason || !reason.trim()) return;
    try {
      const p = posts.find(pp => pp.id === postId);
      await addDoc(collection(db, "reports"), {
        postId, postTitle: p?.title || "", postAuthor: p?.authorName || "",
        reporterUid: user.uid, reporterName: user.name,
        reason: reason.trim(), status: "pending", createdAt: serverTimestamp(),
      });
      // Notify admin
      for (const adminUid of ADMIN_UIDS) {
        await addDoc(collection(db, "userNotifs"), {
          targetUid: adminUid, type: "report", from: user.name,
          postId, postTitle: "⚠️ 貼文「" + (p?.title || "") + "」收到檢舉通報", read: false,
          createdAt: serverTimestamp(),
        });
      }
      // Auto-hide after 3 reports
      try {
        const reportSnap = await getDocs(query(collection(db, "reports"), where("postId", "==", postId)));
        if (reportSnap.size >= 3 && !p?.hidden) {
          await updateDoc(doc(db, "posts", postId), { hidden: true, hiddenBy: "auto_reports", hiddenAt: serverTimestamp() });
          for (const adminUid of ADMIN_UIDS) {
            await addDoc(collection(db, "userNotifs"), {
              targetUid: adminUid, type: "auto_hidden", from: "系統",
              postId, postTitle: "🚨 貼文「" + (p?.title || "") + "」因累計 " + reportSnap.size + " 次檢舉已自動隱藏", read: false,
              createdAt: serverTimestamp(),
            });
          }
        }
      } catch(e) {}
      alert(t.reportSent);
    } catch (e) { console.error("Report error:", e); }
  }

  async function saveCategories() {
    const valid = editCats.filter(c => c.id && (c.labels?.zh || c.labelKey));
    if (valid.length === 0) return alert("至少需要一個類別");
    try {
      await setDoc(doc(db, "config", "categories"), { list: valid });
      setShowCatEditor(false);
      alert("類別已更新");
    } catch (e) { console.error(e); alert("儲存失敗"); }
  }

  function openCatEditor() {
    setEditCats(CATEGORIES.map(c => ({
      id: c.id,
      icon: c.icon,
      color: c.color,
      labelKey: c.labelKey || null,
      labels: c.labels || { zh: c.labelKey ? T.zh[c.labelKey] : "", en: c.labelKey ? T.en[c.labelKey] : "", ja: c.labelKey ? T.ja[c.labelKey] : "" },
    })));
    setShowCatEditor(true);
  }

  function addCategory() {
    if (editCats.length >= 8) return alert("最多 8 個類別");
    setEditCats(prev => [...prev, {
      id: "cat_" + Date.now(),
      icon: CATEGORY_ICONS[prev.length % CATEGORY_ICONS.length],
      color: CATEGORY_COLORS[prev.length % CATEGORY_COLORS.length],
      labelKey: null,
      labels: { zh: "", en: "", ja: "" },
    }]);
  }

  // Save claimed reward to stats before deleting a resolved post
  async function saveClaimedReward(postId) {
    const p = posts.find(pp => pp.id === postId);
    if (p && p.resolved && p.reward > 0) {
      try {
        await setDoc(doc(db, "stats", "claimedRewards"), { total: increment(p.reward) }, { merge: true });
      } catch (e) { console.error("Save claimed reward error:", e); }
    }
  }

  async function adminDeletePost(postId) {
    if (!confirm(t.adminDeleteConfirm)) return;
    try {
      const p = posts.find(pp => pp.id === postId);
      await updateDoc(doc(db, "posts", postId), { hidden: true, hiddenBy: user.uid, hiddenAt: serverTimestamp() });
      await logAdminAction("hide_post", { postId, postTitle: p?.title });
      // Auto-resolve related reports
      const relatedReports = reportsList.filter(r => r.postId === postId && r.status === "pending");
      for (const r of relatedReports) {
        try { await updateDoc(doc(db, "reports", r.id), { status: "resolved" }); } catch {}
      }
      setReportsList(prev => prev.map(r => r.postId === postId && r.status === "pending" ? { ...r, status: "resolved" } : r));
      setSelectedPost(null); setView("feed");
    } catch (e) { alert("刪除失敗"); }
  }

  async function adminRestorePost(postId) {
    if (!confirm("確定要恢復這篇留言嗎？")) return;
    try {
      await updateDoc(doc(db, "posts", postId), { hidden: false, hiddenBy: null, hiddenAt: null });
      await logAdminAction("restore_post", { postId });
    } catch (e) { alert("恢復失敗"); }
  }

  async function adminTogglePin(postId, currentlyPinned) {
    try {
      await updateDoc(doc(db, "posts", postId), { pinned: !currentlyPinned });
      await logAdminAction(currentlyPinned ? "unpin_post" : "pin_post", { postId });
    } catch (e) { alert("操作失敗"); }
  }

  // User self-pin with reward
  async function userPinPost(postId) {
    const p = posts.find(pp => pp.id === postId);
    if (!p) return;
    const pinDays = 3;
    const pinCost = 0; // Free for now, can add cost later
    if (!confirm("📌 置頂貼文 " + pinDays + " 天？\n\n置頂後貼文會出現在列表最上面，增加曝光率。\n\n" + (p.pinned ? "目前已置頂，是否取消？" : "確定要置頂嗎？"))) return;
    try {
      if (p.pinned) {
        await updateDoc(doc(db, "posts", postId), { pinned: false, pinnedUntil: null });
      } else {
        const pinnedUntil = new Date(Date.now() + pinDays * 86400000).toISOString();
        await updateDoc(doc(db, "posts", postId), { pinned: true, pinnedUntil, pinnedBy: user.uid });
      }
    } catch (e) { alert("操作失敗"); }
  }

  // ─── Handover confirmation ───
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverNote, setHandoverNote] = useState("");
  const [handoverPhoto, setHandoverPhoto] = useState(null);
  const [handoverFaceToFace, setHandoverFaceToFace] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);
  // ─── Shelter Animals API (農業部動物認領養) ───
  const [shelterAnimals, setShelterAnimals] = useState([]);
  const [shelterLoading, setShelterLoading] = useState(false);
  const [showShelterMatch, setShowShelterMatch] = useState(false);
  const [mapShelterAnimals, setMapShelterAnimals] = useState([]);
  const [showShelterOnMap, setShowShelterOnMap] = useState(false);
  const [mapLostPets, setMapLostPets] = useState([]);
  const [showLostPetsOnMap, setShowLostPetsOnMap] = useState(false);
  const [mapLostPetsLoading, setMapLostPetsLoading] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);

  // Listen for shelter marker clicks from map iframe
  useEffect(() => {
    function handler(e) {
      if (e.data?.type === "openShelter") {
        const key = e.data.key;
        const animals = mapShelterAnimals.filter(a => (a.shelter_name || "").startsWith(key.substring(0, 20)));
        if (animals.length > 0) {
          setSelectedShelter({
            name: animals[0].shelter_name,
            tel: animals[0].shelter_tel,
            addr: animals[0].shelter_address,
            animals,
          });
        }
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [mapShelterAnimals]);

  // Load shelter animals for map (cached in localStorage for 6 hours)
  const [mapShelterLoading, setMapShelterLoading] = useState(false);
  useEffect(() => {
    if (appMode !== "pet" || feedMode !== "map" || !showShelterOnMap || mapShelterAnimals.length > 0) return;
    // Try cache first
    try {
      const cached = localStorage.getItem("wf_shelter_cache_v7");
      const cachedAt = parseInt(localStorage.getItem("wf_shelter_cache_at_v2") || "0");
      if (cached && Date.now() - cachedAt < 6 * 3600 * 1000) {
        setMapShelterAnimals(JSON.parse(cached));
        return;
      }
    } catch {}
    setMapShelterLoading(true);
    fetch("https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL")
      .then(r => r.json())
      .then(data => {
        // Keep only fields we need to reduce memory
        const allOpen = data.filter(a => a.animal_status === "OPEN");
        // Split: nearby (10km) show all, others limited
        const withDist = allOpen.map(a => {
          const coord = findShelterCoord(a.shelter_name, a.shelter_address, a.animal_place);
          const dist = coord && userLocation ? getDistance(userLocation.lat, userLocation.lng, coord.lat, coord.lng) : 9999;
          return { ...a, _dist: dist };
        });
        const nearby = withDist.filter(a => a._dist <= 10);
        const far = withDist.filter(a => a._dist > 10).slice(0, Math.max(0, 600 - nearby.length));
        const slim = [...nearby, ...far]
          
          .map(a => ({
            animal_kind: a.animal_kind, animal_sex: a.animal_sex,
            animal_bodytype: a.animal_bodytype, animal_age: a.animal_age,
            animal_colour: a.animal_colour, animal_foundplace: a.animal_foundplace,
            animal_place: a.animal_place, animal_sterilization: a.animal_sterilization,
            animal_bacterin: a.animal_bacterin, animal_opendate: a.animal_opendate,
            animal_remark: a.animal_remark, album_file: a.album_file,
            shelter_name: a.shelter_name, shelter_tel: a.shelter_tel, shelter_address: a.shelter_address,
          }));
        setMapShelterAnimals(slim);
        setMapShelterLoading(false);
        try {
          localStorage.setItem("wf_shelter_cache_v7", JSON.stringify(slim));
          localStorage.setItem("wf_shelter_cache_at_v2", String(Date.now()));
        } catch {}
      })
      .catch(() => { setMapShelterAnimals([]); setMapShelterLoading(false); });
  }, [appMode, feedMode, showShelterOnMap]);

  // Load lost pet reports for map (dataset 77682)
  useEffect(() => {
    if (appMode !== "pet" || feedMode !== "map" || !showLostPetsOnMap || mapLostPets.length > 0) return;
    try {
      const cached = localStorage.getItem("wf_lostpet_cache_v3");
      const cachedAt = parseInt(localStorage.getItem("wf_lostpet_cache_v3_at") || "0");
      if (cached && Date.now() - cachedAt < 6 * 3600 * 1000) {
        setMapLostPets(JSON.parse(cached));
        return;
      }
    } catch {}
    setMapLostPetsLoading(true);
    fetch("https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=IFJomqVzyB0i")
      .then(r => r.json())
      .then(data => {
        const slim = data.slice(0, 600).map(a => ({
          chipNo: a["晶片號碼"] || "", petName: a["寵物名"] || "", petKind: a["寵物別"] || "",
          sex: a["性別"] || "", breed: a["品種"] || "", color: a["毛色"] || "",
          appearance: a["外觀"] || "", feature: a["特徵"] || "",
          lostDate: a["遺失時間"] || "", lostPlace: a["遺失地點"] || "",
          ownerName: a["飼主姓名"] || "", phone: a["連絡電話"] || "",
          photo: a["PICTURE"] || "", email: a["EMail"] || "",
        }));
        setMapLostPets(slim);
        setMapLostPetsLoading(false);
        try {
          localStorage.setItem("wf_lostpet_cache_v3", JSON.stringify(slim));
          localStorage.setItem("wf_lostpet_cache_v3_at", String(Date.now()));
        } catch {}
      })
      .catch(() => { setMapLostPets([]); setMapLostPetsLoading(false); });
  }, [appMode, feedMode, showLostPetsOnMap]);

  // District coordinates for found locations (major districts)
  // Taiwan district coordinates (342 districts)
  const DISTRICT_COORDS = {
    "中正區": { lat: 25.0324, lng: 121.5199 },
    "大同區": { lat: 25.0632, lng: 121.5130 },
    "中山區": { lat: 25.0685, lng: 121.5265 },
    "松山區": { lat: 25.0578, lng: 121.5772 },
    "大安區": { lat: 25.0263, lng: 121.5436 },
    "萬華區": { lat: 25.0286, lng: 121.4998 },
    "信義區": { lat: 25.0330, lng: 121.5654 },
    "士林區": { lat: 25.0925, lng: 121.5242 },
    "北投區": { lat: 25.1324, lng: 121.4986 },
    "內湖區": { lat: 25.0697, lng: 121.5885 },
    "南港區": { lat: 25.0546, lng: 121.6069 },
    "文山區": { lat: 24.9887, lng: 121.5705 },
    "板橋區": { lat: 25.0095, lng: 121.4591 },
    "三重區": { lat: 25.0619, lng: 121.4867 },
    "中和區": { lat: 24.9993, lng: 121.4988 },
    "永和區": { lat: 25.0078, lng: 121.5150 },
    "新莊區": { lat: 25.0359, lng: 121.4501 },
    "新店區": { lat: 24.9678, lng: 121.5417 },
    "樹林區": { lat: 24.9906, lng: 121.4207 },
    "鶯歌區": { lat: 24.9539, lng: 121.3540 },
    "三峽區": { lat: 24.9345, lng: 121.3691 },
    "淡水區": { lat: 25.1697, lng: 121.4406 },
    "汐止區": { lat: 25.0628, lng: 121.6584 },
    "瑞芳區": { lat: 25.1085, lng: 121.8100 },
    "土城區": { lat: 24.9723, lng: 121.4434 },
    "蘆洲區": { lat: 25.0851, lng: 121.4735 },
    "五股區": { lat: 25.0827, lng: 121.4382 },
    "泰山區": { lat: 25.0587, lng: 121.4310 },
    "林口區": { lat: 25.0776, lng: 121.3915 },
    "深坑區": { lat: 25.0022, lng: 121.6156 },
    "石碇區": { lat: 24.9917, lng: 121.6584 },
    "坪林區": { lat: 24.9375, lng: 121.7114 },
    "三芝區": { lat: 25.2578, lng: 121.5007 },
    "石門區": { lat: 25.2903, lng: 121.5686 },
    "八里區": { lat: 25.1465, lng: 121.3982 },
    "平溪區": { lat: 25.0257, lng: 121.7387 },
    "雙溪區": { lat: 25.0334, lng: 121.8657 },
    "貢寮區": { lat: 25.0221, lng: 121.9086 },
    "金山區": { lat: 25.2218, lng: 121.6363 },
    "萬里區": { lat: 25.1768, lng: 121.6889 },
    "烏來區": { lat: 24.8651, lng: 121.5507 },
    "桃園區": { lat: 24.9937, lng: 121.3010 },
    "中壢區": { lat: 24.9537, lng: 121.2256 },
    "大溪區": { lat: 24.8804, lng: 121.2865 },
    "楊梅區": { lat: 24.9077, lng: 121.1456 },
    "蘆竹區": { lat: 25.0456, lng: 121.2925 },
    "大園區": { lat: 25.0640, lng: 121.1966 },
    "龜山區": { lat: 25.0000, lng: 121.3378 },
    "八德區": { lat: 24.9284, lng: 121.2846 },
    "龍潭區": { lat: 24.8635, lng: 121.2166 },
    "平鎮區": { lat: 24.9186, lng: 121.2166 },
    "新屋區": { lat: 24.9718, lng: 121.1069 },
    "觀音區": { lat: 25.0338, lng: 121.0776 },
    "復興區": { lat: 24.8199, lng: 121.3527 },
    "中區": { lat: 24.1420, lng: 120.6795 },
    "東區": { lat: 24.1367, lng: 120.6971 },
    "南區": { lat: 24.1211, lng: 120.6600 },
    "西區": { lat: 24.1417, lng: 120.6650 },
    "北區": { lat: 24.1614, lng: 120.6825 },
    "北屯區": { lat: 24.1826, lng: 120.6858 },
    "西屯區": { lat: 24.1815, lng: 120.6394 },
    "南屯區": { lat: 24.1385, lng: 120.6407 },
    "太平區": { lat: 24.1265, lng: 120.7186 },
    "大里區": { lat: 24.0994, lng: 120.6777 },
    "霧峰區": { lat: 24.0616, lng: 120.6997 },
    "烏日區": { lat: 24.1046, lng: 120.6237 },
    "豐原區": { lat: 24.2426, lng: 120.7186 },
    "后里區": { lat: 24.3049, lng: 120.7113 },
    "石岡區": { lat: 24.2748, lng: 120.7802 },
    "東勢區": { lat: 24.2586, lng: 120.8277 },
    "和平區": { lat: 24.1748, lng: 121.0104 },
    "新社區": { lat: 24.2338, lng: 120.8093 },
    "潭子區": { lat: 24.2113, lng: 120.7053 },
    "大雅區": { lat: 24.2295, lng: 120.6479 },
    "神岡區": { lat: 24.2578, lng: 120.6614 },
    "大肚區": { lat: 24.1531, lng: 120.5407 },
    "沙鹿區": { lat: 24.2337, lng: 120.5658 },
    "龍井區": { lat: 24.1926, lng: 120.5457 },
    "梧棲區": { lat: 24.2554, lng: 120.5310 },
    "清水區": { lat: 24.2686, lng: 120.5599 },
    "大甲區": { lat: 24.3486, lng: 120.6224 },
    "外埔區": { lat: 24.3327, lng: 120.6543 },
    "中西區": { lat: 22.9925, lng: 120.2049 },
    "安平區": { lat: 22.9908, lng: 120.1607 },
    "安南區": { lat: 23.0472, lng: 120.1837 },
    "永康區": { lat: 23.0261, lng: 120.2571 },
    "歸仁區": { lat: 22.9673, lng: 120.2937 },
    "新化區": { lat: 23.0384, lng: 120.3103 },
    "左鎮區": { lat: 23.0576, lng: 120.4085 },
    "玉井區": { lat: 23.1240, lng: 120.4610 },
    "楠西區": { lat: 23.1735, lng: 120.4854 },
    "南化區": { lat: 23.0432, lng: 120.4790 },
    "仁德區": { lat: 22.9722, lng: 120.2517 },
    "關廟區": { lat: 22.9622, lng: 120.3277 },
    "龍崎區": { lat: 22.9656, lng: 120.3872 },
    "官田區": { lat: 23.1935, lng: 120.3143 },
    "麻豆區": { lat: 23.1817, lng: 120.2481 },
    "佳里區": { lat: 23.1651, lng: 120.1774 },
    "西港區": { lat: 23.1235, lng: 120.2039 },
    "七股區": { lat: 23.1401, lng: 120.1400 },
    "將軍區": { lat: 23.1990, lng: 120.1550 },
    "學甲區": { lat: 23.2325, lng: 120.1806 },
    "北門區": { lat: 23.2670, lng: 120.1259 },
    "新營區": { lat: 23.3106, lng: 120.3166 },
    "後壁區": { lat: 23.3670, lng: 120.3620 },
    "白河區": { lat: 23.3512, lng: 120.4157 },
    "東山區": { lat: 23.3260, lng: 120.4030 },
    "六甲區": { lat: 23.2318, lng: 120.3477 },
    "下營區": { lat: 23.2355, lng: 120.2634 },
    "柳營區": { lat: 23.2782, lng: 120.3117 },
    "鹽水區": { lat: 23.3197, lng: 120.2664 },
    "善化區": { lat: 23.1320, lng: 120.2966 },
    "大內區": { lat: 23.1189, lng: 120.3486 },
    "山上區": { lat: 23.1029, lng: 120.3585 },
    "新市區": { lat: 23.0797, lng: 120.2953 },
    "安定區": { lat: 23.1201, lng: 120.2374 },
    "新興區": { lat: 22.6314, lng: 120.3055 },
    "前金區": { lat: 22.6274, lng: 120.2947 },
    "苓雅區": { lat: 22.6216, lng: 120.3117 },
    "鹽埕區": { lat: 22.6249, lng: 120.2836 },
    "鼓山區": { lat: 22.6467, lng: 120.2799 },
    "旗津區": { lat: 22.5885, lng: 120.2843 },
    "前鎮區": { lat: 22.5885, lng: 120.3183 },
    "三民區": { lat: 22.6477, lng: 120.3020 },
    "楠梓區": { lat: 22.7285, lng: 120.3266 },
    "小港區": { lat: 22.5654, lng: 120.3577 },
    "左營區": { lat: 22.6905, lng: 120.2944 },
    "仁武區": { lat: 22.7016, lng: 120.3477 },
    "大社區": { lat: 22.7305, lng: 120.3462 },
    "岡山區": { lat: 22.7960, lng: 120.2946 },
    "路竹區": { lat: 22.8570, lng: 120.2618 },
    "阿蓮區": { lat: 22.8834, lng: 120.3272 },
    "田寮區": { lat: 22.8763, lng: 120.3810 },
    "燕巢區": { lat: 22.7930, lng: 120.3620 },
    "橋頭區": { lat: 22.7573, lng: 120.3057 },
    "梓官區": { lat: 22.7605, lng: 120.2668 },
    "彌陀區": { lat: 22.7830, lng: 120.2470 },
    "永安區": { lat: 22.8175, lng: 120.2340 },
    "湖內區": { lat: 22.9058, lng: 120.2126 },
    "鳳山區": { lat: 22.6273, lng: 120.3620 },
    "大寮區": { lat: 22.6053, lng: 120.3955 },
    "林園區": { lat: 22.5028, lng: 120.3944 },
    "鳥松區": { lat: 22.6608, lng: 120.3625 },
    "大樹區": { lat: 22.6934, lng: 120.4270 },
    "旗山區": { lat: 22.8880, lng: 120.4830 },
    "美濃區": { lat: 22.8977, lng: 120.5416 },
    "六龜區": { lat: 22.9986, lng: 120.6323 },
    "內門區": { lat: 22.9436, lng: 120.4633 },
    "杉林區": { lat: 22.9704, lng: 120.5350 },
    "甲仙區": { lat: 23.0847, lng: 120.5900 },
    "桃源區": { lat: 23.1595, lng: 120.7594 },
    "那瑪夏區": { lat: 23.2170, lng: 120.6923 },
    "茂林區": { lat: 22.8862, lng: 120.6631 },
    "茄萣區": { lat: 22.9061, lng: 120.1826 },
    "仁愛區": { lat: 25.1263, lng: 121.7404 },
    "安樂區": { lat: 25.1291, lng: 121.7147 },
    "暖暖區": { lat: 25.0994, lng: 121.7358 },
    "七堵區": { lat: 25.0961, lng: 121.6538 },
    "香山區": { lat: 24.7663, lng: 120.9282 },
    "竹東鎮": { lat: 24.7333, lng: 121.0895 },
    "新埔鎮": { lat: 24.8271, lng: 121.0730 },
    "關西鎮": { lat: 24.7920, lng: 121.1770 },
    "湖口鄉": { lat: 24.9036, lng: 121.0433 },
    "新豐鄉": { lat: 24.9010, lng: 120.9861 },
    "芎林鄉": { lat: 24.7746, lng: 121.0779 },
    "橫山鄉": { lat: 24.7211, lng: 121.1214 },
    "北埔鄉": { lat: 24.6994, lng: 121.0501 },
    "寶山鄉": { lat: 24.7543, lng: 120.9970 },
    "峨眉鄉": { lat: 24.6866, lng: 121.0143 },
    "尖石鄉": { lat: 24.7060, lng: 121.1979 },
    "五峰鄉": { lat: 24.6104, lng: 121.1109 },
    "苑裡鎮": { lat: 24.4243, lng: 120.6522 },
    "通霄鎮": { lat: 24.4890, lng: 120.6785 },
    "竹南鎮": { lat: 24.6857, lng: 120.8722 },
    "後龍鎮": { lat: 24.6127, lng: 120.7864 },
    "卓蘭鎮": { lat: 24.3105, lng: 120.8226 },
    "大湖鄉": { lat: 24.4222, lng: 120.8635 },
    "公館鄉": { lat: 24.5010, lng: 120.8259 },
    "銅鑼鄉": { lat: 24.4899, lng: 120.7862 },
    "南庄鄉": { lat: 24.5980, lng: 120.9962 },
    "頭屋鄉": { lat: 24.5709, lng: 120.8557 },
    "三義鄉": { lat: 24.3839, lng: 120.7433 },
    "西湖鄉": { lat: 24.5406, lng: 120.7541 },
    "造橋鄉": { lat: 24.6392, lng: 120.8721 },
    "三灣鄉": { lat: 24.6537, lng: 120.9540 },
    "獅潭鄉": { lat: 24.5222, lng: 120.9028 },
    "泰安鄉": { lat: 24.4225, lng: 120.9967 },
    "和美鎮": { lat: 24.1104, lng: 120.4989 },
    "鹿港鎮": { lat: 24.0573, lng: 120.4351 },
    "溪湖鎮": { lat: 23.9622, lng: 120.4796 },
    "二林鎮": { lat: 23.8996, lng: 120.3743 },
    "田中鎮": { lat: 23.8608, lng: 120.5820 },
    "北斗鎮": { lat: 23.8709, lng: 120.5203 },
    "花壇鄉": { lat: 24.0304, lng: 120.5386 },
    "芬園鄉": { lat: 24.0139, lng: 120.6293 },
    "大村鄉": { lat: 23.9938, lng: 120.5411 },
    "永靖鄉": { lat: 23.9241, lng: 120.5477 },
    "伸港鄉": { lat: 24.1520, lng: 120.4830 },
    "線西鄉": { lat: 24.1300, lng: 120.4650 },
    "福興鄉": { lat: 24.0500, lng: 120.4400 },
    "秀水鄉": { lat: 24.0350, lng: 120.5000 },
    "埔心鄉": { lat: 23.9530, lng: 120.5430 },
    "埔鹽鄉": { lat: 23.9950, lng: 120.4650 },
    "大城鄉": { lat: 23.8500, lng: 120.3200 },
    "芳苑鄉": { lat: 23.9250, lng: 120.3200 },
    "竹塘鄉": { lat: 23.8600, lng: 120.4200 },
    "社頭鄉": { lat: 23.8960, lng: 120.5830 },
    "二水鄉": { lat: 23.8100, lng: 120.6200 },
    "田尾鄉": { lat: 23.8880, lng: 120.5230 },
    "埤頭鄉": { lat: 23.8900, lng: 120.4600 },
    "溪州鄉": { lat: 23.8500, lng: 120.4900 },
    "埔里鎮": { lat: 23.9650, lng: 120.9650 },
    "草屯鎮": { lat: 23.9739, lng: 120.6800 },
    "竹山鎮": { lat: 23.7570, lng: 120.6800 },
    "集集鎮": { lat: 23.8290, lng: 120.7830 },
    "名間鄉": { lat: 23.8380, lng: 120.6900 },
    "鹿谷鄉": { lat: 23.7440, lng: 120.7530 },
    "中寮鄉": { lat: 23.8790, lng: 120.7660 },
    "魚池鄉": { lat: 23.8960, lng: 120.9370 },
    "國姓鄉": { lat: 24.0410, lng: 120.8600 },
    "水里鄉": { lat: 23.8120, lng: 120.8570 },
    "信義鄉": { lat: 23.6970, lng: 120.8570 },
    "仁愛鄉": { lat: 24.0230, lng: 121.1330 },
    "斗南鎮": { lat: 23.6800, lng: 120.4800 },
    "虎尾鎮": { lat: 23.7080, lng: 120.4400 },
    "西螺鎮": { lat: 23.7970, lng: 120.4660 },
    "土庫鎮": { lat: 23.6780, lng: 120.3920 },
    "北港鎮": { lat: 23.5750, lng: 120.3020 },
    "古坑鄉": { lat: 23.6450, lng: 120.5620 },
    "大埤鄉": { lat: 23.6450, lng: 120.4270 },
    "莿桐鄉": { lat: 23.7580, lng: 120.5000 },
    "林內鄉": { lat: 23.7580, lng: 120.6120 },
    "二崙鄉": { lat: 23.7710, lng: 120.4130 },
    "崙背鄉": { lat: 23.7580, lng: 120.3520 },
    "麥寮鄉": { lat: 23.7530, lng: 120.2500 },
    "東勢鄉": { lat: 23.6740, lng: 120.2500 },
    "褒忠鄉": { lat: 23.6900, lng: 120.3080 },
    "臺西鄉": { lat: 23.7040, lng: 120.2000 },
    "元長鄉": { lat: 23.6500, lng: 120.3150 },
    "四湖鄉": { lat: 23.6370, lng: 120.2270 },
    "口湖鄉": { lat: 23.5820, lng: 120.1870 },
    "水林鄉": { lat: 23.5720, lng: 120.2470 },
    "布袋鎮": { lat: 23.3780, lng: 120.1670 },
    "大林鎮": { lat: 23.6030, lng: 120.4700 },
    "民雄鄉": { lat: 23.5520, lng: 120.4290 },
    "溪口鄉": { lat: 23.6100, lng: 120.3930 },
    "新港鄉": { lat: 23.5520, lng: 120.3470 },
    "六腳鄉": { lat: 23.4900, lng: 120.2900 },
    "東石鄉": { lat: 23.4580, lng: 120.1530 },
    "義竹鄉": { lat: 23.3350, lng: 120.2400 },
    "鹿草鄉": { lat: 23.4030, lng: 120.3080 },
    "水上鄉": { lat: 23.4300, lng: 120.4000 },
    "中埔鄉": { lat: 23.4180, lng: 120.5300 },
    "竹崎鄉": { lat: 23.5250, lng: 120.5470 },
    "梅山鄉": { lat: 23.5820, lng: 120.5580 },
    "番路鄉": { lat: 23.4650, lng: 120.5300 },
    "大埔鄉": { lat: 23.3000, lng: 120.6000 },
    "阿里山鄉": { lat: 23.5080, lng: 120.7500 },
    "潮州鎮": { lat: 22.5500, lng: 120.5430 },
    "東港鎮": { lat: 22.4670, lng: 120.4530 },
    "恆春鎮": { lat: 22.0030, lng: 120.7450 },
    "萬丹鄉": { lat: 22.5880, lng: 120.4850 },
    "長治鄉": { lat: 22.6800, lng: 120.5300 },
    "麟洛鄉": { lat: 22.6500, lng: 120.5200 },
    "九如鄉": { lat: 22.7400, lng: 120.4900 },
    "里港鄉": { lat: 22.7800, lng: 120.4900 },
    "鹽埔鄉": { lat: 22.7500, lng: 120.5700 },
    "高樹鄉": { lat: 22.8200, lng: 120.6000 },
    "萬巒鄉": { lat: 22.5700, lng: 120.5700 },
    "內埔鄉": { lat: 22.6100, lng: 120.5700 },
    "竹田鄉": { lat: 22.5800, lng: 120.5400 },
    "新埤鄉": { lat: 22.4700, lng: 120.5500 },
    "枋寮鄉": { lat: 22.3600, lng: 120.5900 },
    "新園鄉": { lat: 22.5400, lng: 120.4600 },
    "崁頂鄉": { lat: 22.5100, lng: 120.5100 },
    "林邊鄉": { lat: 22.4300, lng: 120.5100 },
    "南州鄉": { lat: 22.4900, lng: 120.5100 },
    "佳冬鄉": { lat: 22.4200, lng: 120.5500 },
    "琉球鄉": { lat: 22.3420, lng: 120.3710 },
    "車城鄉": { lat: 22.0700, lng: 120.7100 },
    "滿州鄉": { lat: 22.0200, lng: 120.8400 },
    "枋山鄉": { lat: 22.2600, lng: 120.6500 },
    "三地門鄉": { lat: 22.7100, lng: 120.6500 },
    "霧臺鄉": { lat: 22.7500, lng: 120.7300 },
    "瑪家鄉": { lat: 22.6800, lng: 120.6400 },
    "泰武鄉": { lat: 22.5900, lng: 120.6300 },
    "來義鄉": { lat: 22.5200, lng: 120.6300 },
    "春日鄉": { lat: 22.3600, lng: 120.6300 },
    "獅子鄉": { lat: 22.1900, lng: 120.6700 },
    "牡丹鄉": { lat: 22.1000, lng: 120.7900 },
    "羅東鎮": { lat: 24.6771, lng: 121.7669 },
    "蘇澳鎮": { lat: 24.5950, lng: 121.8420 },
    "頭城鎮": { lat: 24.8580, lng: 121.8230 },
    "礁溪鄉": { lat: 24.8270, lng: 121.7730 },
    "壯圍鄉": { lat: 24.7450, lng: 121.7830 },
    "員山鄉": { lat: 24.7450, lng: 121.7220 },
    "冬山鄉": { lat: 24.6350, lng: 121.7920 },
    "五結鄉": { lat: 24.6850, lng: 121.7980 },
    "三星鄉": { lat: 24.6650, lng: 121.6530 },
    "大同鄉": { lat: 24.6000, lng: 121.5500 },
    "南澳鄉": { lat: 24.4650, lng: 121.8000 },
    "鳳林鎮": { lat: 23.7450, lng: 121.4520 },
    "玉里鎮": { lat: 23.3350, lng: 121.3150 },
    "新城鄉": { lat: 24.1280, lng: 121.6400 },
    "吉安鄉": { lat: 23.9550, lng: 121.5680 },
    "壽豐鄉": { lat: 23.8700, lng: 121.5100 },
    "光復鄉": { lat: 23.6650, lng: 121.4200 },
    "豐濱鄉": { lat: 23.5950, lng: 121.5200 },
    "瑞穗鄉": { lat: 23.4980, lng: 121.3750 },
    "富里鄉": { lat: 23.1800, lng: 121.2500 },
    "秀林鄉": { lat: 24.1200, lng: 121.6200 },
    "萬榮鄉": { lat: 23.7150, lng: 121.4100 },
    "卓溪鄉": { lat: 23.3450, lng: 121.3050 },
    "成功鎮": { lat: 23.0980, lng: 121.3720 },
    "關山鎮": { lat: 23.0450, lng: 121.1620 },
    "卑南鄉": { lat: 22.7900, lng: 121.0900 },
    "鹿野鄉": { lat: 22.9130, lng: 121.1350 },
    "池上鄉": { lat: 23.1220, lng: 121.2150 },
    "東河鄉": { lat: 22.9700, lng: 121.2900 },
    "長濱鄉": { lat: 23.3200, lng: 121.4500 },
    "太麻里鄉": { lat: 22.6100, lng: 121.0100 },
    "大武鄉": { lat: 22.3600, lng: 120.8900 },
    "綠島鄉": { lat: 22.6600, lng: 121.4800 },
    "海端鄉": { lat: 23.1000, lng: 121.1700 },
    "延平鄉": { lat: 22.9000, lng: 121.0800 },
    "金峰鄉": { lat: 22.5900, lng: 120.9600 },
    "達仁鄉": { lat: 22.3000, lng: 120.8800 },
    "蘭嶼鄉": { lat: 22.0500, lng: 121.5400 },
    "湖西鄉": { lat: 23.5800, lng: 119.6500 },
    "白沙鄉": { lat: 23.6600, lng: 119.6000 },
    "西嶼鄉": { lat: 23.6000, lng: 119.5100 },
    "望安鄉": { lat: 23.3600, lng: 119.5000 },
    "七美鄉": { lat: 23.2000, lng: 119.4300 },
    "金城鎮": { lat: 24.4321, lng: 118.3171 },
    "金湖鎮": { lat: 24.4400, lng: 118.4200 },
    "金沙鎮": { lat: 24.4800, lng: 118.4200 },
    "金寧鄉": { lat: 24.4500, lng: 118.3300 },
    "烈嶼鄉": { lat: 24.4300, lng: 118.2400 },
    "南竿鄉": { lat: 26.1608, lng: 119.9509 },
    "北竿鄉": { lat: 26.2200, lng: 120.0000 },
    "莒光鄉": { lat: 25.9700, lng: 119.9400 },
    "東引鄉": { lat: 26.3700, lng: 120.4900 },
  };


  // Shelter coordinates (major public shelters in Taiwan)
  // Taiwan public animal shelters (official list with verified coordinates)
  const SHELTER_LIST = [
    { name: "基隆市寵物銀行", addr: "基隆市七堵區大華三路45-12號（欣欣安樂園旁）", tel: "02-24560148", lat: 25.127359, lng: 121.675307 },
    { name: "新北市板橋區公立動物之家", addr: "新北市板橋區板城路28-1號", tel: "02-89662158", lat: 24.995559, lng: 121.447931 },
    { name: "新北市新店區公立動物之家", addr: "新北市新店區安康路一段235號", tel: "02-22159462", lat: 24.927175, lng: 121.490974 },
    { name: "新北市中和區公立動物之家", addr: "新北市中和區興南路三段100號", tel: "02-86685547", lat: 24.975694, lng: 121.488567 },
    { name: "新北市淡水區公立動物之家", addr: "新北市淡水區下圭柔山91-3號", tel: "02-26267558", lat: 25.209973, lng: 121.43038 },
    { name: "新北市瑞芳區公立動物之家", addr: "新北市瑞芳區靜安路四段（106縣道74.5K清潔隊場區內）", tel: "02-24063481", lat: 25.076045, lng: 121.799386 },
    { name: "新北市五股區公立動物之家", addr: "新北市五股區外寮路9-9號", tel: "02-82925265", lat: 25.077651, lng: 121.415762 },
    { name: "新北市八里區公立動物之家", addr: "新北市八里區長坑里6鄰長坑道路36號", tel: "02-26194428", lat: 25.087688, lng: 121.398216 },
    { name: "新北市三芝區公立動物之家", addr: "新北市三芝區青山路", tel: "02-26365436", lat: 25.226802, lng: 121.538284 },
    { name: "臺北市動物之家", addr: "臺北市內湖區安美街191號", tel: "02-87913254、02-87913255", lat: 25.063111, lng: 121.608935 },
    { name: "桃園市動物保護教育園區", addr: "桃園市新屋區永興里3鄰藻礁路1668號", tel: "03-4861760", lat: 25.008369, lng: 121.02785 },
    { name: "新竹市動物保護教育園區", addr: "新竹市南寮里海濱路250號", tel: "03-5360070", lat: 24.833014, lng: 120.919729 },
    { name: "新竹縣動物保護教育園區", addr: "新竹縣竹北市縣政五街192號", tel: "03-5519548", lat: 24.828454, lng: 121.015049 },
    { name: "苗栗縣動物保護教育園區", addr: "苗栗縣銅鑼鄉朝陽村6鄰朝北55-1號", tel: "037-558228", lat: 24.499644, lng: 120.794078 },
    { name: "臺中市動物之家南屯園區", addr: "臺中市南屯區中台路601號", tel: "04-23850976", lat: 24.147655, lng: 120.575223 },
    { name: "臺中市動物之家后里園區", addr: "臺中市后里區堤防路370號", tel: "04-25588024", lat: 24.286376, lng: 120.70956 },
    { name: "彰化縣流浪狗中途之家臨時收容所", addr: "彰化縣芳苑鄉文津段436-4地號", tel: "0972-821052", lat: 23.932676, lng: 120.367307 },
    { name: "南投縣公立動物收容所", addr: "南投縣南投市嶺興路36-1號", tel: "049-2225440", lat: 23.905892, lng: 120.669862 },
    { name: "雲林縣流浪動物收容所", addr: "雲林縣斗六市雲林路二段517號", tel: "05-5523300", lat: 23.69829, lng: 120.526037 },
    { name: "嘉義市動物保護教育園區", addr: "嘉義市彌陀路31號旁", tel: "05-2168661", lat: 23.46433, lng: 120.468821 },
    { name: "嘉義縣動物保護教育園區", addr: "嘉義縣民雄鄉松山村後山仔37之2號", tel: "05-2721119", lat: 23.547642, lng: 120.505491 },
    { name: "臺南市動物之家灣裡站", addr: "臺南市南區省躬里14鄰萬年路580巷92號", tel: "06-2964439", lat: 22.93682, lng: 120.194171 },
    { name: "臺南市動物之家善化站", addr: "臺南市善化區昌隆里東勢寮1-19號", tel: "06-5832399", lat: 23.148843, lng: 120.331579 },
    { name: "高雄市壽山動物保護教育園區", addr: "高雄市鼓山區萬壽路350號", tel: "07-5519059", lat: 22.637352, lng: 120.277749 },
    { name: "高雄市燕巢動物保護關愛園區", addr: "高雄市燕巢區師大路98號", tel: "07-6051002", lat: 22.792658, lng: 120.404704 },
    { name: "屏東縣公立犬貓中途之家", addr: "屏東縣內埔鄉學府路1號附近", tel: "08-7702114", lat: 22.648524, lng: 120.605699 },
    { name: "屏東縣動物之家", addr: "屏東縣潮州鎮志成路東段", tel: "08-7801426", lat: 22.656229, lng: 120.549338 },
    { name: "宜蘭縣流浪動物中途之家", addr: "宜蘭縣五結鄉成興村利寶路60號", tel: "03-9602350分機620", lat: 24.667217, lng: 121.831626 },
    { name: "花蓮縣狗貓躍動園區", addr: "花蓮縣鳳林鎮林榮里永豐路255號", tel: "03-8421452", lat: 23.806063, lng: 121.498308 },
    { name: "臺東縣流浪動物收容中心", addr: "臺東縣臺東市中華路四段999巷600-1號", tel: "089-362011", lat: 22.719608, lng: 121.100977 },
    { name: "澎湖縣流浪動物收容中心", addr: "澎湖縣馬公市烏崁里260、261號", tel: "06-9213559", lat: 23.552165, lng: 119.627311 },
    { name: "金門縣動物收容中心", addr: "金門縣金湖鎮裕民農莊20號", tel: "082-336625", lat: 24.444104, lng: 118.444795 },
    { name: "連江縣流浪犬收容中心", addr: "連江縣南竿鄉", tel: "", lat: 26.166298, lng: 119.960433 },
  ];

  function findShelterCoord(shelterName, address, place) {
    const n = (shelterName || "").replace(/\s/g, "");
    // 1. Exact/partial name match
    for (const s of SHELTER_LIST) {
      const sn = s.name.replace(/\s/g, "");
      if (n && (n.includes(sn) || sn.includes(n))) return { lat: s.lat, lng: s.lng };
    }
    // 2. Keyword match (district/location name)
    const kws = [
      ["板橋", 0], ["新店", 0], ["中和", 0], ["淡水", 0], ["瑞芳", 0], ["五股", 0], ["八里", 0], ["三芝", 0],
      ["基隆", 0], ["桃園", 0], ["新竹市", 0], ["新竹縣", 0], ["苗栗", 0], ["南屯", 0], ["后里", 0],
      ["彰化", 0], ["南投", 0], ["雲林", 0], ["嘉義市", 0], ["嘉義縣", 0], ["灣裡", 0], ["善化", 0],
      ["壽山", 0], ["燕巢", 0], ["屏東", 0], ["宜蘭", 0], ["花蓮", 0], ["臺東", 0], ["台東", 0],
      ["澎湖", 0], ["金門", 0], ["連江", 0], ["馬祖", 0],
    ];
    for (const [kw] of kws) {
      if (n.includes(kw)) {
        const found = SHELTER_LIST.find(s => s.name.includes(kw));
        if (found) return { lat: found.lat, lng: found.lng };
      }
    }
    // 3. Match by address
    const addr = address || "";
    for (const s of SHELTER_LIST) {
      if (addr && s.addr && addr.substring(0, 10) === s.addr.substring(0, 10)) return { lat: s.lat, lng: s.lng };
    }
    // 4. Fallback: district
    for (const d in DISTRICT_COORDS) { if (addr.includes(d)) return DISTRICT_COORDS[d]; }
    for (const k in SHELTER_COORDS) { if (addr.includes(k.replace("市","").replace("縣",""))) return SHELTER_COORDS[k]; }
    for (const k2 in SHELTER_COORDS) { if (place && place.includes(k2.replace("市","").replace("縣",""))) return SHELTER_COORDS[k2]; }
    return null;
  }

  const SHELTER_COORDS = {
    "臺北市": { lat: 25.0093, lng: 121.5665 },
    "新北市": { lat: 25.0169, lng: 121.4628 },
    "基隆市": { lat: 25.1105, lng: 121.7350 },
    "桃園市": { lat: 24.9932, lng: 121.2168 },
    "新竹市": { lat: 24.8138, lng: 120.9675 },
    "新竹縣": { lat: 24.8387, lng: 121.0177 },
    "苗栗縣": { lat: 24.5602, lng: 120.8214 },
    "臺中市": { lat: 24.1477, lng: 120.6736 },
    "彰化縣": { lat: 24.0685, lng: 120.5424 },
    "南投縣": { lat: 23.9609, lng: 120.9718 },
    "雲林縣": { lat: 23.7092, lng: 120.4313 },
    "嘉義市": { lat: 23.4801, lng: 120.4491 },
    "嘉義縣": { lat: 23.4518, lng: 120.2555 },
    "臺南市": { lat: 22.9999, lng: 120.2270 },
    "高雄市": { lat: 22.6273, lng: 120.3014 },
    "屏東縣": { lat: 22.5519, lng: 120.5487 },
    "宜蘭縣": { lat: 24.7021, lng: 121.7378 },
    "花蓮縣": { lat: 23.9871, lng: 121.6015 },
    "臺東縣": { lat: 22.7583, lng: 121.1444 },
    "澎湖縣": { lat: 23.5711, lng: 119.5793 },
    "金門縣": { lat: 24.4321, lng: 118.3171 },
    "連江縣": { lat: 26.1608, lng: 119.9509 },
  };

  const CITY_MAP = {    "台北": "臺北市", "臺北": "臺北市", "新北": "新北市", "桃園": "桃園市",
    "台中": "臺中市", "臺中": "臺中市", "台南": "臺南市", "臺南": "臺南市",
    "高雄": "高雄市", "基隆": "基隆市", "新竹": "新竹市", "嘉義": "嘉義市",
    "苗栗": "苗栗縣", "彰化": "彰化縣", "南投": "南投縣", "雲林": "雲林縣",
    "屏東": "屏東縣", "宜蘭": "宜蘭縣", "花蓮": "花蓮縣", "台東": "臺東縣",
    "臺東": "臺東縣", "澎湖": "澎湖縣", "金門": "金門縣", "連江": "連江縣",
  };

  async function fetchShelterAnimals(petPost) {
    setShelterLoading(true);
    setShowShelterMatch(true);
    try {
      let data;
      // Try cache first
      try {
        const cached = localStorage.getItem("wf_shelter_full_v2");
        const cachedAt = parseInt(localStorage.getItem("wf_shelter_full_at_v2") || "0");
        if (cached && Date.now() - cachedAt < 6 * 3600 * 1000) {
          data = JSON.parse(cached);
        }
      } catch {}
      if (!data) {
        const res = await fetch("https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL");
        data = await res.json();
        try {
          const slim = data.filter(a => a.animal_status === "OPEN").slice(0, 300).map(a => ({
            animal_kind: a.animal_kind, animal_sex: a.animal_sex, animal_status: a.animal_status,
            animal_bodytype: a.animal_bodytype, animal_colour: a.animal_colour,
            animal_foundplace: a.animal_foundplace, animal_place: a.animal_place,
            album_file: a.album_file, shelter_name: a.shelter_name, shelter_tel: a.shelter_tel,
          }));
          localStorage.setItem("wf_shelter_full_v2", JSON.stringify(slim));
          localStorage.setItem("wf_shelter_full_at_v2", String(Date.now()));
          data = slim;
        } catch {}
      }
      // Determine animal kind
      const kindMap = { pet_dog: "狗", pet_cat: "貓" };
      const targetKind = kindMap[petPost.category] || "";
      // Extract city from location
      const locText = (petPost.locationText || "") + (petPost.desc || "");
      let targetCity = "";
      for (const [key, val] of Object.entries(CITY_MAP)) {
        if (locText.includes(key)) { targetCity = val; break; }
      }
      // Filter: same kind, in shelter (not adopted), recent
      const filtered = data.filter(a => {
        if (a.animal_status !== "OPEN") return false;
        if (targetKind && a.animal_kind !== targetKind) return false;
        if (targetCity && !a.animal_place?.includes(targetCity.replace("市", "").replace("縣", ""))) return false;
        return true;
      }).slice(0, 20);
      setShelterAnimals(filtered);
    } catch (e) {
      console.error("Shelter API error:", e);
      setShelterAnimals([]);
    }
    setShelterLoading(false);
  }

  // ─── Similar Post Detection ───
  function getTextSimilarity(a, b) {
    if (!a || !b) return 0;
    const wa = new Set(a.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, "").split(""));
    const wb = new Set(b.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, "").split(""));
    let match = 0;
    wa.forEach(c => { if (wb.has(c)) match++; });
    return match / Math.max(wa.size, wb.size, 1);
  }

  function findSimilarPosts(p) {
    if (!p) return { posts: [], shelter: [], lostPets: [] };
    const isPet = PET_CATS.includes(p.category);

    // 1. Platform posts
    const similarPosts = posts.filter(pp => {
      if (pp.id === p.id || pp.hidden) return false;
      let score = 0;
      // Same category
      if (pp.category === p.category) score += 2;
      // Same mode (pet vs item)
      if (isPet === PET_CATS.includes(pp.category)) score += 1;
      // Opposite postType (lost vs found = potential match!)
      if (p.postType && pp.postType && p.postType !== pp.postType && isPet === PET_CATS.includes(pp.category)) score += 3;
      // Title similarity
      score += getTextSimilarity(p.title, pp.title) * 3;
      // Description similarity
      score += getTextSimilarity(p.desc, pp.desc) * 2;
      // Location match
      if (p.locationText && pp.locationText && getTextSimilarity(p.locationText, pp.locationText) > 0.3) score += 2;
      if (p.airport && pp.airport && p.airport === pp.airport) score += 2;
      // Date proximity (within 7 days)
      if (p.date && pp.date) {
        const d = Math.abs(new Date(p.date) - new Date(pp.date)) / 86400000;
        if (d <= 3) score += 2;
        else if (d <= 7) score += 1;
      }
      // Pet fields
      if (isPet && PET_CATS.includes(pp.category)) {
        if (p.petBreed && pp.petBreed && getTextSimilarity(p.petBreed, pp.petBreed) > 0.5) score += 2;
        if (p.petColor && pp.petColor && getTextSimilarity(p.petColor, pp.petColor) > 0.3) score += 2;
        if (p.petSize && pp.petSize && p.petSize === pp.petSize) score += 1;
      }
      return score >= 4;
    }).slice(0, 5);

    // 2. Shelter animals (if pet)
    const similarShelter = isPet ? mapShelterAnimals.filter(a => {
      let score = 0;
      const kind = p.category === "pet_dog" ? "狗" : p.category === "pet_cat" ? "貓" : "";
      if (kind && a.animal_kind === kind) score += 2;
      if (p.petColor && a.animal_colour && getTextSimilarity(p.petColor, a.animal_colour) > 0.3) score += 2;
      if (p.locationText && a.animal_foundplace && getTextSimilarity(p.locationText, a.animal_foundplace) > 0.2) score += 2;
      return score >= 3;
    }).slice(0, 5) : [];

    // 3. Lost pet reports (if pet)
    const similarLostPets = isPet ? mapLostPets.filter(a => {
      let score = 0;
      const kind = p.category === "pet_dog" ? "狗" : p.category === "pet_cat" ? "貓" : "";
      if (kind && a.petKind === kind) score += 2;
      if (p.petBreed && a.breed && getTextSimilarity(p.petBreed, a.breed) > 0.3) score += 2;
      if (p.petColor && a.color && getTextSimilarity(p.petColor, a.color) > 0.3) score += 2;
      if (p.locationText && a.lostPlace && getTextSimilarity(p.locationText, a.lostPlace) > 0.2) score += 2;
      return score >= 3;
    }).slice(0, 5) : [];

    return { posts: similarPosts, shelter: similarShelter, lostPets: similarLostPets };
  }

  // Image proxy for government API photos (bypass CORS)
  function proxyImg(url) {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    return "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=200&q=70";
  }

  const [showPostPopup, setShowPostPopup] = useState(false);
  // ─── PWA Install Prompt ───
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    // Detect if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsStandalone(standalone);

    // Android/Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after 30s if not installed and not dismissed
    let dismissed = false;
    try { dismissed = localStorage.getItem("wf_install_dismissed") === "1"; } catch {}
    if (!standalone && !dismissed) {
      const timer = setTimeout(() => setShowInstallBanner(true), 30000);
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function triggerInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
        try { localStorage.setItem("wf_install_dismissed", "1"); } catch {}
      }
      setInstallPrompt(null);
    }
  }

  function dismissInstall() {
    setShowInstallBanner(false);
    try { localStorage.setItem("wf_install_dismissed", "1"); } catch {}
  }
  const [showHomeAds, setShowHomeAds] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lf_notif_prefs") || "{}"); } catch { return {}; }
  });
  const notifPrefEnabled = (type) => notifPrefs[type] !== false;
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef(null);

  function generateShareImage(postTitle) {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    // Polyfill roundRect
    if (!ctx.roundRect) ctx.roundRect = function(x,y,w,h,r) { this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); };

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 500);
    grad.addColorStop(0, "#1B4965");
    grad.addColorStop(1, "#2D6E9E");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, 600, 500, 20);
    ctx.fill();

    // Success icon
    ctx.font = "60px serif";
    ctx.textAlign = "center";
    ctx.fillText("🎉", 300, 75);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("成功找回物品！", 300, 125);

    // Item name
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#A8D0E6";
    const title = postTitle.length > 15 ? postTitle.substring(0, 15) + "⋯" : postTitle;
    ctx.fillText("「" + title + "」", 300, 165);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 190);
    ctx.lineTo(500, 190);
    ctx.stroke();

    // Description
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.fillText("透過 What'sfind 遺失物互助平台", 300, 225);
    ctx.fillText("順利找回遺失物品", 300, 255);

    // CTA
    ctx.fillStyle = "#4ADE80";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("你也有遺失物品嗎？立即使用 ↓", 300, 300);

    // QR code area - white background
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(210, 320, 130, 130, 10);
    ctx.fill();

    // URL below QR
    ctx.fillStyle = "#A8D0E6";
    ctx.font = "13px sans-serif";
    ctx.fillText("whatsfind-app.vercel.app", 300, 475);

    // Logo text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("what'sfind", 370, 375);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#A8D0E6";
    ctx.fillText("遺失物互助平台", 370, 395);

    // Green dot on logo
    ctx.fillStyle = "#4ADE80";
    ctx.beginPath();
    ctx.roundRect(421, 360, 4, 6, 2);
    ctx.fill();

    return canvas;
  }

  async function shareSuccess(postTitle) {
    setShowShareCard(true);
    setTimeout(async () => {
      try {
        const canvas = generateShareImage(postTitle);
        const ctx = canvas.getContext("2d");

        // Generate QR code and draw it
        const qrDataUrl = await QRCode.toDataURL("https://whatsfind-app.vercel.app", { width: 110, margin: 1, color: { dark: "#1B4965", light: "#ffffff" } });
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 220, 330, 110, 110);

          // Load and draw logo icon
          const logoImg = new Image();
          logoImg.onload = () => {
            ctx.drawImage(logoImg, 370, 405, 40, 40);
            if (shareCardRef.current) shareCardRef.current.src = canvas.toDataURL("image/png");
          };
          logoImg.onerror = () => {
            if (shareCardRef.current) shareCardRef.current.src = canvas.toDataURL("image/png");
          };
          logoImg.src = "/logo.png";
        };
        qrImg.src = qrDataUrl;
      } catch(e) {
        console.error(e);
        const canvas = generateShareImage(postTitle);
        if (shareCardRef.current) shareCardRef.current.src = canvas.toDataURL("image/png");
      }
    }, 100);
  }

  async function confirmHandover(postId) {
    setShowHandoverForm(true);
  }

  async function submitHandover(postId) {
    try {
      let loc = null;
      try {
        const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
        loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch(e) {}

      const receiptNo = "WF-" + Date.now().toString(36).toUpperCase();
      let signatureData = null;
      let otherSignatureData = null;
      try {
        const sigCanvas = document.getElementById("signatureCanvas");
        if (sigCanvas) {
          const sigCtx = sigCanvas.getContext("2d");
          const imgData = sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height);
          if (imgData.data.some((v, i) => i % 4 === 3 && v > 0)) signatureData = sigCanvas.toDataURL("image/png");
        }
        const sigCanvas2 = document.getElementById("signatureCanvas2");
        if (sigCanvas2) {
          const sigCtx2 = sigCanvas2.getContext("2d");
          const imgData2 = sigCtx2.getImageData(0, 0, sigCanvas2.width, sigCanvas2.height);
          if (imgData2.data.some((v, i) => i % 4 === 3 && v > 0)) otherSignatureData = sigCanvas2.toDataURL("image/png");
        }
      } catch(e) {}

      await setDoc(doc(db, "posts", postId, "handover", user.uid), {
        uid: user.uid, name: user.name, email: user.email || "",
        confirmedAt: serverTimestamp(), receiptNo, location: loc,
        note: handoverNote.trim(), photo: handoverPhoto || null,
        signature: signatureData, otherSignature: otherSignatureData,
        deviceInfo: navigator.userAgent.substring(0, 100),
      });

      // Check if both parties confirmed
      const p = posts.find(pp => pp.id === postId);
      const handoverSnap = await getDocs(collection(db, "posts", postId, "handover"));
      const confirmers = handoverSnap.docs.map(d => d.data().uid);
      const ownerConfirmed = confirmers.includes(p?.authorUid);
      const otherConfirmed = confirmers.some(uid => uid !== p?.authorUid);

      if (ownerConfirmed && otherConfirmed) {
        // Both confirmed → auto resolve
        await updateDoc(doc(db, "posts", postId), { resolved: true, resolvedAt: serverTimestamp(), resolvedBy: "handover" });
        // Notify both parties
        const otherUid = confirmers.find(uid => uid !== user.uid);
        if (otherUid) {
          await addDoc(collection(db, "userNotifs"), {
            targetUid: otherUid, type: "handover_complete",
            postId, postTitle: p?.title || "", from: user.name,
            createdAt: serverTimestamp(),
          });
        }
        alert("✅ 雙方已確認交接完成！貼文已標記為「已尋回」。\n\n請互相給予評價 ⭐");
      } else {
        // Notify the other party to confirm
        const targetUid = user.uid === p?.authorUid ? confirmers.find(uid => uid !== p?.authorUid) : p?.authorUid;
        if (targetUid) {
          await addDoc(collection(db, "userNotifs"), {
            targetUid, type: "handover_pending",
            postId, postTitle: p?.title || "", from: user.name,
            createdAt: serverTimestamp(),
          });
        }
        alert("✅ 已送出交接確認！\n\n⏰ 等待對方確認交接。\n對方 48 小時內未確認將自動完成。");
        // Set 48h auto-resolve
        await updateDoc(doc(db, "posts", postId), {
          handoverInitiated: true,
          handoverInitiatedAt: serverTimestamp(),
          handoverInitiatedBy: user.uid,
        });
      }

      setShowHandoverForm(false);
      setHandoverNote("");
      setHandoverPhoto(null);
    } catch (e) { console.error(e); alert("確認失敗：" + e.message); }
  }

  function handleHandoverPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 600 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.10;
        ctx.font = "bold " + Math.max(12, canvas.width * 0.04) + "px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("what'sfind 交接紀錄", 8, canvas.height - 12);
        ctx.restore();
        setHandoverPhoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Listen to handover confirmations
  const [handoverStatus, setHandoverStatus] = useState({ owner: false, claimant: false });
  useEffect(() => {
    if (!selectedPost) { setHandoverStatus({ owner: false, claimant: false }); return; }
    const pid = selectedPost.id;
    const unsub = onSnapshot(collection(db, "posts", pid, "handover"), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const ownerDoc = docs.find(d => d.id === selectedPost.authorUid);
      const claimantDoc = docs.find(d => d.id !== selectedPost.authorUid);
      setHandoverStatus({
        owner: !!ownerDoc,
        claimant: !!claimantDoc,
        ownerData: ownerDoc || null,
        claimantData: claimantDoc || null,
      });
    }, () => {});
    return unsub;
  }, [selectedPost?.id]);

  // ─── Rating ───
  const [showRating, setShowRating] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingTarget, setRatingTarget] = useState(null);

  async function submitRating(postId, targetUid, targetName) {
    if (ratingStars === 0) return;
    if (!targetUid || !targetName) { alert("找不到評價對象"); return; }
    // Prevent self-rating
    if (targetUid === user.uid) { alert("不能給自己評價"); return; }
    // Check if already rated this post
    try {
      const existing = await getDocs(query(collection(db, "ratings"), where("postId", "==", postId), where("raterUid", "==", user.uid)));
      if (!existing.empty) { alert("您已經評價過這篇貼文了"); return; }
    } catch(e) {}
    try {
      await addDoc(collection(db, "ratings"), {
        postId: postId || "", raterUid: user.uid, raterName: user.name,
        targetUid, targetName,
        stars: ratingStars, createdAt: serverTimestamp(),
      });
      setShowRating(false); setRatingStars(0); setRatingTarget(null);
      alert(t.rateThanks);
    } catch (e) { console.error("Rating error:", e); alert("評價失敗：" + e.message); }
  }

  // ─── Announcements ───
  const [announcements, setAnnouncements] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dataViewerCol, setDataViewerCol] = useState(null);
  const [dataViewerDocs, setDataViewerDocs] = useState(null);
  const [dataViewerDoc, setDataViewerDoc] = useState(null);
  const [hintCat, setHintCat] = useState("lost");
  const [showDonateInfo, setShowDonateInfo] = useState(false);
  const [annExpanded, setAnnExpanded] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState("");
  const [editingAnnounce, setEditingAnnounce] = useState(null);
  const [editAnnounceText, setEditAnnounceText] = useState("");

  // ─── Auto-reply bot ───
  const [autoReplies, setAutoReplies] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "autoReply"), (snap) => {
      if (snap.exists() && Array.isArray(snap.data().rules)) {
        setAutoReplies(snap.data().rules);
      }
    }, () => {});
    return unsub;
  }, []);

  async function triggerAutoReply(postId, postTitle, postDesc) {
    const text = (postTitle + " " + postDesc).toLowerCase();
    for (const rule of autoReplies) {
      if (!rule.enabled) continue;
      const keywords = rule.keywords.split(",").map(k => k.trim().toLowerCase());
      if (keywords.some(k => k && text.includes(k))) {
        await addDoc(collection(db, "posts", postId, "replies"), {
          authorUid: "bot", author: "🤖 助手", text: rule.reply,
          createdAt: serverTimestamp(),
        });
        break;
      }
    }
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "announcements"), orderBy("createdAt", "desc")),
      (snap) => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return unsub;
  }, []);

  async function postAnnouncement() {
    if (!newAnnounce.trim()) return;
    try {
      await addDoc(collection(db, "announcements"), {
        text: newAnnounce, authorName: user.name, createdAt: serverTimestamp(),
      });
      setNewAnnounce("");
      alert("✅ 公告已發佈！");
    } catch(e) {
      console.error("Announcement error:", e);
      alert("發佈失敗：" + e.message);
    }
  }

  async function deleteAnnouncement(id) {
    try {
      await deleteDoc(doc(db, "announcements", id));
    } catch(e) {
      alert("刪除失敗：" + e.message);
    }
  }

  // ─── Auto expire check (90 days) ───
  function isExpired(p) {
    if (!p.date) return false;
    const diff = Math.floor((new Date() - new Date(p.date)) / 86400000);
    return diff > 60 && !p.resolved;
  }
  function daysUntilExpire(p) {
    if (!p.date) return 999;
    const diff = Math.floor((new Date() - new Date(p.date)) / 86400000);
    return Math.max(0, 60 - diff);
  }
  function postAgeDays(p) {
    if (!p.date) return 0;
    return Math.floor((new Date() - new Date(p.date)) / 86400000);
  }

  // ─── Profile: load user's ratings ───
  useEffect(() => {
    if (!user || view !== "profile") return;
    getDocs(query(collection(db, "ratings"), where("targetUid", "==", user.uid))).then(snap => {
      setUserRatings(snap.docs.map(d => d.data()));
    }).catch(() => {});
  }, [view, user?.uid]);

  const myPosts = posts.filter(p => p.authorUid === user?.uid);
  const [myPostFilter, setMyPostFilter] = useState("all");
  const avgRating = userRatings.length > 0 ? (userRatings.reduce((s, r) => s + r.stars, 0) / userRatings.length).toFixed(1) : "5.0";
  
  // Credit score calculation
  // Start: 100 points
  // Deductions:
  //   - Low rating (≤2 stars): -15 per review
  //   - Post hidden by admin: -10 per post
  //   - Being blocked: -50
  // Bonuses:
  //   - Successfully resolved: +2 per post
  //   - High rating (5 stars): +1 per review
  const lowRatings = userRatings.filter(r => r.stars <= 2).length;
  const highRatings = userRatings.filter(r => r.stars >= 4).length;
  const hiddenPosts = myPosts.filter(p => p.hidden).length;
  const resolvedCount = myPosts.filter(p => p.resolved).length;
  const creditScore = Math.max(0, Math.min(100,
    100
    - (lowRatings * 5)        // 低評價扣 5 分
    - (hiddenPosts * 3)       // 被管理員隱藏扣 3 分
    - (isBlocked ? 20 : 0)    // 被封鎖扣 20 分
    + (resolvedCount * 5)     // 成功尋回加 5 分
    + (highRatings * 3)       // 好評(4-5星)加 3 分
  ));

  // ─── Share ───
  function generatePostShareImage(p, loadedPhotos, logoImg, qrImg, textImg) {
    const hasPhotos = loadedPhotos && loadedPhotos.length > 0;
    const photoCount = hasPhotos ? loadedPhotos.length : 0;
    const singlePhoto = photoCount === 1;

    // ─── Layout constants ───
    const bottomBarH = 110;
    const rightColX = 360;
    const rightColW = 210;
    const leftColW = singlePhoto ? 300 : 520; // narrower when photo on right

    // ─── Pre-calculate description lines ───
    const measureCanvas = document.createElement("canvas");
    const mCtx = measureCanvas.getContext("2d");
    mCtx.font = "18px sans-serif";
    const descRaw = (p.desc || "").replace(/\n航班：.+/, "");
    const descText = descRaw.replace(/\n/g, " ");
    const flightMatch = (p.desc || "").match(/航班：(.+)/);
    const descLines = [];
    if (descText) {
      let currentLine = "";
      for (let ci = 0; ci < descText.length; ci++) {
        const ch = descText[ci];
        if (mCtx.measureText(currentLine + ch).width > leftColW) {
          descLines.push(currentLine);
          currentLine = ch;
        } else {
          currentLine += ch;
        }
      }
      if (currentLine) descLines.push(currentLine);
    }

    // ─── Calculate photo dimensions ───
    let photoRowH = 0;
    let photoWList = [];
    let singlePhotoH = 0;
    if (hasPhotos) {
      if (singlePhoto) {
        // Right column contain-fit
        const img = loadedPhotos[0];
        const scale = Math.min(rightColW / img.width, 280 / img.height);
        singlePhotoH = Math.round(img.height * scale);
      } else {
        // Multi-photo stacked row
        const totalW = 540;
        const gap = 8;
        const pw = (totalW - gap * (photoCount - 1)) / photoCount;
        loadedPhotos.forEach((img) => {
          const h = Math.round(pw * (img.height / img.width));
          if (h > photoRowH) photoRowH = h;
          photoWList.push(pw);
        });
        if (photoRowH > 300) photoRowH = 300;
      }
    }

    // ─── Calculate canvas height ───
    let leftH = 24;                                  // top padding
    leftH += 30 + 20;                                // badge row + gap
    leftH += 30;                                     // title
    if (!singlePhoto && hasPhotos) leftH += 14 + photoRowH + 14; // stacked photos
    leftH += 24;                                     // location
    if (p.date) leftH += 28;                         // date
    const hasCreatedAt = p.createdAt?.toDate || p.createdAt?.seconds;
    if (hasCreatedAt) leftH += 28;                   // post creation time
    if (flightMatch) leftH += 28;                    // flight number
    if (p.reward > 0) leftH += 30;                   // reward
    leftH += 16 + 1 + 22;                            // divider gaps
    leftH += descLines.length * 26;                  // description
    leftH += 24;                                     // gap before bottom

    let contentH = leftH;
    if (singlePhoto) {
      // Right column starts after badge row: 24 + 30 + 20 = 74
      const rightContentH = 74 + singlePhotoH + 24;
      contentH = Math.max(leftH, rightContentH);
    }

    const canvasH = Math.max(contentH + bottomBarH, 280);

    // ─── Create canvas ───
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    // Polyfill roundRect
    if (!ctx.roundRect) ctx.roundRect = function(x,y,w,h,r) { this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); };

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, canvasH);
    grad.addColorStop(0, "#1B4965");
    grad.addColorStop(1, "#2D6E9E");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, canvasH);

    // ─── Draw ───
    let dy = 24;

    // Category badge
    const shareCategory = catInfo(p.category);
    const shareCatName = shareCategory.icon + " " + catLabel(shareCategory);
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#E05A33";
    ctx.fillRect(24, dy, 120, 30);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(shareCatName, 32, dy + 21);

    // PostType badge
    let postTypeBadge = "";
    if (PET_CATS.includes(p.category)) {
      if (p.postType === "lost") postTypeBadge = "🐾 我的寵物走失了";
      else if (p.postType === "found") postTypeBadge = "🐾 我發現走失寵物";
    } else if (p.postType === "lost") postTypeBadge = "😰 我遺失了";
    else if (p.postType === "found") postTypeBadge = "🔍 我撿到了";
    if (p.wrongType === "took") postTypeBadge = "🙋 我拿錯別人的";
    else if (p.wrongType === "taken") postTypeBadge = "😰 我的被拿走了";

    if (postTypeBadge) {
      ctx.font = "bold 13px sans-serif";
      const badgeW = ctx.measureText(postTypeBadge).width + 20;
      const badgeX = 150;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.roundRect(badgeX, dy, badgeW, 28, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(postTypeBadge, badgeX + 10, dy + 20);
    }

    // Status badge
    if (!p.resolved) {
      const statusX = singlePhoto ? 160 : 470;
      ctx.fillStyle = "#E9A825";
      ctx.fillRect(statusX, dy, 106, 30);
      ctx.fillStyle = "#fff";
      ctx.fillText("⏳ 尋找中", statusX + 16, dy + 21);
    }
    dy += 30 + 20;

    // ─── Single photo: draw on right side ───
    if (singlePhoto) {
      const img = loadedPhotos[0];
      const scale = Math.min(rightColW / img.width, 280 / img.height);
      const drawW = Math.round(img.width * scale);
      const drawH = Math.round(img.height * scale);
      const photoX = rightColX + Math.round((rightColW - drawW) / 2);
      const photoY = dy;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, drawW, drawH, 12);
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.width, img.height, photoX, photoY, drawW, drawH);
      ctx.restore();
    }

    // Title (left side)
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    const titleMax = singlePhoto ? 12 : 18;
    const title = p.title.length > titleMax ? p.title.substring(0, titleMax) + "⋯" : p.title;
    ctx.textAlign = "left";
    ctx.fillText(title, 30, dy + 4);
    dy += 30;

    // ─── Multi-photo: stacked below title ───
    if (hasPhotos && !singlePhoto) {
      dy += 14;
      const totalW = 540;
      const gap = 8;
      loadedPhotos.forEach((img, i) => {
        const pw = photoWList[i];
        const dx = 30 + i * (pw + gap);
        const scale = Math.min(pw / img.width, photoRowH / img.height);
        const drawW = Math.round(img.width * scale);
        const drawH = Math.round(img.height * scale);
        const offsetX = dx + Math.round((pw - drawW) / 2);
        const offsetY = dy + Math.round((photoRowH - drawH) / 2);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(offsetX, offsetY, drawW, drawH, 10);
        ctx.clip();
        ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawW, drawH);
        ctx.restore();
      });
      dy += photoRowH + 14;
    }

    // Location
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#A8D0E6";
    ctx.textAlign = "left";
    const locText = "📍 " + (p.airport || p.locationText || "");
    ctx.fillText(singlePhoto ? locText.substring(0, 20) : locText, 30, dy + 4);
    dy += 24;

    // Date
    if (p.date) {
      ctx.fillText("📅 " + p.date, 30, dy + 4);
      dy += 28;
    }

    // Post creation time
    const createdTime = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString("zh-TW") : p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleString("zh-TW") : null;
    if (createdTime) {
      ctx.fillText("🕐 發文時間：" + createdTime, 30, dy + 4);
      dy += 28;
    }

    // Flight number
    if (flightMatch) {
      ctx.fillText("✈️ 航班：" + flightMatch[1], 30, dy + 4);
      dy += 28;
    }

    // Reward
    if (p.reward > 0) {
      ctx.fillStyle = "#E9A825";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("💰 感謝金 NT$" + p.reward.toLocaleString(), 30, dy + 4);
      dy += 30;
    }

    // Divider
    dy += 16;
    const dividerEnd = singlePhoto ? 330 : 570;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(30, dy);
    ctx.lineTo(dividerEnd, dy);
    ctx.stroke();
    dy += 22;

    // Description
    if (descLines.length > 0) {
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.textAlign = "left";
      for (let li = 0; li < descLines.length; li++) {
        ctx.fillText(descLines[li], 30, dy + 4);
        dy += 26;
      }
    }

    // Bottom bar
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, canvasH - bottomBarH, 600, bottomBarH);

    // Logo image (bottom-left)
    if (logoImg) {
      ctx.drawImage(logoImg, 24, canvasH - bottomBarH + 28, 52, 52);
    }

    // Logo text (right of logo)
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("what'sfind", 84, canvasH - bottomBarH + 50);
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#A8D0E6";
    ctx.fillText("防冒領遺失物 · 走失寵物協尋平台", 84, canvasH - bottomBarH + 70);

    // QR code (bottom-right, above URL)
    if (qrImg) {
      const qrSize = 56;
      const qrX = 500 - qrSize / 2;
      const qrY = canvasH - bottomBarH + 22;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 6);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      // URL centered under QR
      ctx.fillStyle = "#A8D0E6";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("whatsfind-app.vercel.app", qrX + qrSize / 2, qrY + qrSize + 16);
    } else {
      ctx.fillStyle = "#A8D0E6";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("whatsfind-app.vercel.app", 560, canvasH - bottomBarH + 70);
    }

    // ─── Diagonal text image (top right) ───
    if (textImg) {
      const txtW = 250;
      const txtH = Math.round(textImg.height * (txtW / textImg.width));
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.translate(canvas.width - 20, 15);
      ctx.rotate(-8 * Math.PI / 180);
      ctx.drawImage(textImg, -txtW, 0, txtW, txtH);
      ctx.restore();
    }

    return canvas;
  }

  const [showPostShareCard, setShowPostShareCard] = useState(null);
  const postShareImgRef = useRef(null);

  function sharePost(p) {
    const url = window.location.origin + "/?post=" + p.id;
    const shareCat = catInfo(p.category);
    const text = shareCat.icon + " " + catLabel(shareCat) + " - " + p.title;
    setShowPostShareCard({ post: p, url, text });
    setTimeout(function() {
      // Collect images to load: post photos (max 3) + logo + QR code
      var photoSrcs = (p.photos && p.photos.length > 0 && !isPhotoExpired(p.photosUploadedAt)) ? p.photos.slice(0, 3) : [];
      var loadedPhotos = [];
      var logoImg = null;
      var qrImg = null;
      var textImg = null;
      var totalToLoad = photoSrcs.length + 3; // photos + logo + QR + text
      var loadedCount = 0;

      // Determine which text image to use
      var isPet = PET_CATS.includes(p.category);
      var isFoundSide = p.postType === "found" || p.category === "found" || (isPet && p.postType === "found");
      var textSrc = isFoundSide ? "/share-found.PNG" : "/share-lost.PNG";

      function onAllLoaded() {
        var canvas = generatePostShareImage(p, loadedPhotos, logoImg, qrImg, textImg);
        if (postShareImgRef.current) postShareImgRef.current.src = canvas.toDataURL("image/png");
      }

      function onOneLoaded() {
        loadedCount++;
        if (loadedCount >= totalToLoad) onAllLoaded();
      }

      // Load text image
      var tImg = new Image();
      tImg.onload = function() { textImg = tImg; onOneLoaded(); };
      tImg.onerror = function() { onOneLoaded(); };
      tImg.src = textSrc;

      // Load post photos
      photoSrcs.forEach(function(src, i) {
        var img = new Image();
        img.onload = function() { loadedPhotos[i] = img; onOneLoaded(); };
        img.onerror = function() { onOneLoaded(); };
        img.src = src;
      });

      // Load logo
      var logo = new Image();
      logo.onload = function() { logoImg = logo; onOneLoaded(); };
      logo.onerror = function() { onOneLoaded(); };
      logo.src = "/logo.png";

      // Load QR code
      var qr = new Image();
      qr.onload = function() { qrImg = qr; onOneLoaded(); };
      qr.onerror = function() { onOneLoaded(); };
      qr.src = "/WhatsFind_QRCode.png";
    }, 100);
  }

  // ─── Share image to social platform ───
  async function shareImageToSocial(platform) {
    const img = postShareImgRef.current;
    if (!img || !showPostShareCard) return;
    const { text, url } = showPostShareCard;
    const fullText = text + " " + url;

    if (platform === "save") {
      // Save image via Web Share API or lightbox
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const file = new File([blob], "whatsfind-post.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "What'sfind" });
          alert("✅ 圖片已分享！");
          return;
        }
      } catch(e) {
        if (e.name === "AbortError") return;
      }
      setLightbox({ photos: [img.src], index: 0 });
      alert("📱 長按圖片即可儲存到相簿");
    } else if (platform === "all") {
      // Share image + text via system share sheet (best for iOS)
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const file = new File([blob], "whatsfind-post.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "What'sfind", text: fullText });
          return;
        }
      } catch(e) {
        if (e.name === "AbortError") return;
      }
      // Fallback: copy text
      try { await navigator.clipboard.writeText(fullText); alert("文字已複製！"); } catch(e) {}
    } else if (platform === "copy") {
      try { await navigator.clipboard.writeText(url); alert("✅ 連結已複製！"); } catch(e) { alert("複製失敗"); }
    }
  }

  // ─── Flight auto-fill ───
  const AIRLINE_CODES = { CI: "桃園國際機場 (TPE)", BR: "桃園國際機場 (TPE)", IT: "桃園國際機場 (TPE)", JX: "桃園國際機場 (TPE)", B7: "桃園國際機場 (TPE)", AE: "松山機場 (TSA)", GE: "松山機場 (TSA)", JL: "東京成田 (NRT)", NH: "東京羽田 (HND)", MM: "大阪關西 (KIX)", KE: "首爾仁川 (ICN)", OZ: "首爾仁川 (ICN)", TW: "濟州 (CJU)", SQ: "新加坡樟宜 (SIN)", CX: "香港赤鱲角 (HKG)", TG: "曼谷素萬那普 (BKK)", FD: "曼谷廊曼 (DMK)", VJ: "胡志明市 (SGN)", VN: "河內 (HAN)", AK: "吉隆坡 (KUL)", GA: "雅加達 (CGK)", PR: "馬尼拉 (MNL)", MF: "廈門高崎 (XMN)", CA: "北京大興 (PKX)", MU: "上海浦東 (PVG)", CZ: "廣州白雲 (CAN)", AA: "洛杉磯 (LAX)", UA: "舊金山 (SFO)", BA: "倫敦希斯洛 (LHR)", AF: "巴黎戴高樂 (CDG)", LH: "法蘭克福 (FRA)", QF: "雪梨 (SYD)", AC: "溫哥華 (YVR)" };
  const AIRLINE_NAMES = { CI: "中華航空", BR: "長榮航空", IT: "台灣虎航", JX: "星宇航空", B7: "立榮航空", AE: "華信航空", GE: "華信航空", JL: "日本航空", NH: "全日空", MM: "樂桃航空", KE: "大韓航空", OZ: "韓亞航空", TW: "德威航空", SQ: "新加坡航空", CX: "國泰航空", TG: "泰國航空", FD: "泰亞航空", VJ: "越捷航空", VN: "越南航空", AK: "亞洲航空", GA: "印尼嘉魯達", PR: "菲律賓航空", MF: "廈門航空", CA: "中國國航", MU: "東方航空", CZ: "南方航空", AA: "美國航空", UA: "聯合航空", BA: "英國航空", AF: "法國航空", LH: "漢莎航空", QF: "澳洲航空", AC: "加拿大航空" };
  const [flightInfo, setFlightInfo] = useState(null);

  function autoFillFlight(code) {
    const raw = code.replace(/[\s-]/g, "").toUpperCase();
    const airline = raw.replace(/[^A-Z]/g, "").slice(0, 2);
    const num = raw.replace(/[^0-9]/g, "");
    if (airline && num) {
      const formatted = airline + "-" + num;
      if (formatted !== code) setFormFlight(formatted);
      if (AIRLINE_CODES[airline] && !formAirport) setFormAirport(AIRLINE_CODES[airline]);
      if (!formDate) setFormDate(new Date().toISOString().slice(0, 10));
      setFlightInfo(AIRLINE_NAMES[airline] ? { airline: AIRLINE_NAMES[airline], code: formatted } : null);
    } else {
      setFlightInfo(null);
    }
  }

  // ─── Map: get airport coords ───
  function getAirportCoords(name) {
    const a = AIRPORTS_DATA.find(ap => ap.name === name);
    return a ? { lat: a.lat, lng: a.lng } : null;
  }

  // Listen to claims subcollection when viewing a post
  useEffect(() => {
    if (!selectedPost || !user) { setPostClaims([]); setApprovedContact(null); setOwnerContact(null); return; }
    const pid = selectedPost.id;
    // Claims listener
    const unsubClaims = onSnapshot(
      collection(db, "posts", pid, "claims"),
      (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Owner sees all, claimant sees only own
        if (isOwner(selectedPost)) {
          setPostClaims(all);
        } else {
          setPostClaims(all.filter(c => c.claimantUid === user.uid));
        }
      },
      (err) => { console.error("Claims listener error:", err); setPostClaims([]); }
    );

    // If owner or admin, load contact from private
    if (isOwner(selectedPost) || isAdmin) {
      getDoc(doc(db, "posts", pid, "private", "data")).then(d => {
        setOwnerContact(d.exists() ? d.data().contact : null);
      }).catch(() => setOwnerContact(null));
    }
    // If not owner, listen to approved contact (real-time)
    let unsubApproved = () => {};
    if (!isOwner(selectedPost)) {
      unsubApproved = onSnapshot(doc(db, "posts", pid, "approved", user.uid), (d) => {
        setApprovedContact(d.exists() ? d.data().contact : null);
      }, () => setApprovedContact(null));
    }

    return () => { unsubClaims(); unsubApproved(); };
  }, [selectedPost?.id, user?.uid]);

  // Load author's credit info when viewing a post
  const [authorCredit, setAuthorCredit] = useState(null);
  useEffect(() => {
    if (!selectedPost || !selectedPost.authorUid) { setAuthorCredit(null); return; }
    getDocs(query(collection(db, "ratings"), where("targetUid", "==", selectedPost.authorUid))).then(snap => {
      const ratings = snap.docs.map(d => d.data());
      const low = ratings.filter(r => r.stars <= 2).length;
      const high = ratings.filter(r => r.stars >= 4).length;
      const authorPosts = posts.filter(p => p.authorUid === selectedPost.authorUid);
      const hidden = authorPosts.filter(p => p.hidden).length;
      const resolved = authorPosts.filter(p => p.resolved).length;
      const score = Math.max(0, Math.min(100, 100 - (low * 5) - (hidden * 3) + (resolved * 5) + (high * 3)));
      setAuthorCredit({ score, ratingCount: ratings.length });
    }).catch(() => setAuthorCredit(null));
  }, [selectedPost?.id]);
  const [showHidden, setShowHidden] = useState(false);
  const filtered = posts.filter(p => {
    // Filter by app mode
    if (appMode === "item" && PET_CATS.includes(p.category)) return false;
    if (appMode === "pet" && !PET_CATS.includes(p.category)) return false;
    if (p.hidden && !isAdmin) return false;
    if (p.hidden && isAdmin && !showHidden) return false;
    if (isExpired(p) && !isAdmin) return false;
    if (catGroup === "airport" && !AIRPORT_CATS.includes(p.category)) return false;
    if (catGroup === "general" && !GENERAL_CATS.includes(p.category)) return false;
    if (filter !== "all" && p.category !== filter) return false;
    if (rewardFilter && !(p.reward > 0 && !p.resolved)) return false;
    if (statusFilter === "active" && p.resolved) return false;
    if (statusFilter === "resolved" && !p.resolved) return false;
    if (airportFilter && p.airport !== airportFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const match = (p.title || "").toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q) || (p.airport || "").toLowerCase().includes(q) || (p.locationText || "").toLowerCase().includes(q) || (p.authorName || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (dateFilter && p.date !== dateFilter) return false;
    return true;
  }).sort((a, b) => {
    // Sort: pinned first, then unresolved, then resolved, then expired
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (!a.resolved && b.resolved) return -1;
    if (a.resolved && !b.resolved) return 1;
    if (isExpired(a) && !isExpired(b)) return 1;
    if (!isExpired(a) && isExpired(b)) return -1;
    return 0;
  });
  const hiddenCount = posts.filter(p => p.hidden).length;

  // ─── Post Actions ───
  async function handleSubmit() {
    if (isBlocked) { alert("您的帳號已被封鎖，無法發文。"); return; }
    if (honeypot) { return; } // Honeypot trap
    if (!checkRateLimit("post")) return;
    const finalAirport = formAirport === "其他" ? (formCustomAirport.trim() || "其他") : formAirport;
    const isPetPost = PET_CATS.includes(formCat);
    if (isPetPost) {
      if (!formCat || (!formLocationText.trim() && !formLocation) || !formTitle || !formDesc) return;
      if (!formPetLine && !formPetPhone) { alert("請至少填寫一種聯絡方式（LINE 或電話）"); return; }
    } else {
      if (!formCat || (!formAirport && !formLocationText.trim() && !formLocation) || !formTitle || !formDesc || !formContact) return;
    }
    const cleanTitle = maskLinks(sanitize(formTitle));
    const cleanDesc = maskLinks(sanitize(formDesc));
    if (cleanTitle !== sanitize(formTitle) || cleanDesc !== sanitize(formDesc)) {
      alert("⚠️ 貼文中的連結已自動遮蔽為 ***\n\n為保護用戶安全，貼文內容不允許包含外部連結。");
    }
    if (containsBadWords(cleanTitle + cleanDesc)) { alert("內容包含不當詞語，請修改後重新發佈。"); return; }
    // Warn scam keywords
    const scamFound = detectScamWords(cleanTitle + " " + cleanDesc);
    if (scamFound.length > 0) {
      const count = await logScamAttempt("post", cleanTitle + " " + cleanDesc, scamFound);
      if (count >= 10) { alert("⛔ 您已多次觸發詐騙偵測，帳號已被限制發文。\n如有疑問請聯繫客服。"); return; }
      if (!confirm("⚠️ 偵測到可能的敏感關鍵字：\n「" + scamFound.join("、") + "」\n\nWhat'sfind 不鼓勵在貼文中涉及金融交易資訊。\n\n⚠️ 已記錄第 " + count + " 次警告\n確定要發佈嗎？")) return;
    }
    const validQs = formVerifyQs.filter(v => v.q.trim() && v.a.trim());
    if (validQs.length === 0 && !(isPetPost && formPetSkipVerify)) return;
    try {
      // Public post (no answers, no contact info)
      const postRef = await addDoc(collection(db, "posts"), {
        category: formCat, airport: finalAirport, title: cleanTitle,
        desc: cleanDesc + (formFlight ? "\n航班：" + sanitize(formFlight) : ""),
        date: formDate,
        authorUid: user.uid, authorName: user.name, authorAvatar: user.avatar || null,
        verifyQuestions: validQs.map(v => ({ q: v.q })),
        resolved: false, replies: [],
        reward: formReward ? parseInt(formReward) : 0,
        time: formTime || null,
        photos: formPhotos,
        photosUploadedAt: formPhotos.length > 0 ? new Date().toISOString() : null,
        location: formLocation || null,
        locationText: formLocationText || null,
        pinned: usePin,
        hotBadge: false,
        proBadge: false,
        wrongType: formCat === "wrong" ? formWrongType : null,
        postType: (["wallet", "id_doc", "electronics", "keys"].includes(formCat) || PET_CATS.includes(formCat)) ? formPostType : null,
        // Pet detail fields
        ...(PET_CATS.includes(formCat) ? {
          petName: formPetName || null,
          petGender: formPetGender || null,
          petBreed: formPetBreed || null,
          petColor: formPetColor || null,
          petFeature: formPetFeature || null,
          petChip: formPetChip || null,
          petAge: formPetAge || null,
          petSize: formPetSize || null,
          petSubType: formPetSubType || null,
          petLine: formPetLine || null,
          petPhone: formPetPhone || null,
          petSkipVerify: formPetSkipVerify,
        } : {}),
        createdAt: serverTimestamp(),
      });
      // Deduct pin reward
      if (usePin) {
        try {
          const rDoc = await getDoc(doc(db, "referrals", user.uid));
          const cnt = Math.max(0, (rDoc.data()?.count || 0) - 1);
          await setDoc(doc(db, "referrals", user.uid), { count: cnt }, { merge: true });
          setUsePin(false);
        } catch(e) {}
      }
      // Private subcollection (only author can read)
      await setDoc(doc(db, "posts", postRef.id, "private", "data"), {
        contact: (formContactType === "line" ? "LINE: " : formContactType === "email" ? "Email: " : "電話: ") + formContact,
        verifyAnswers: validQs.map(v => v.a.trim().toLowerCase()),
      });
      const wasPet = PET_CATS.includes(formCat); setSubmitted(true); setShowPetSuccessTips(wasPet);
      // Trigger auto-reply bot
      triggerAutoReply(postRef.id, formTitle, formDesc).catch(() => {});
    } catch (e) { console.error("Post error:", e); alert("發佈失敗，請再試一次"); }
  }

  // Photo compression and upload
  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    if (formPhotos.length + files.length > 3) { alert("最多 3 張照片"); return; }
    files.forEach(file => {
      if (!file.type.startsWith("image/")) { alert("僅支援圖片格式"); return; }
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(ext)) { alert("僅支援 JPG、PNG、GIF、WebP 格式"); return; }
      if (file.size > 10 * 1024 * 1024) { alert("圖片大小不能超過 10MB"); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          // Resize: max 800px width, keep aspect ratio
          const maxW = 800;
          let w = img.width, h = img.height;
          if (w > maxW) { h = h * maxW / w; w = maxW; }
          canvas.width = Math.round(w);
          canvas.height = Math.round(h);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Add logo watermark
          const wm = new Image();
          wm.onload = () => {
            ctx.save();
            const wmSize = Math.max(80, canvas.width * 0.50);
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.globalAlpha = 0.15;
            ctx.drawImage(wm, (canvas.width - wmSize) / 2, (canvas.height - wmSize) / 2, wmSize, wmSize);
            ctx.restore();
            // Compress: try 0.6 first, if > 200KB try 0.4
            let compressed = canvas.toDataURL("image/jpeg", 0.6);
            if (compressed.length > 200 * 1024 * 1.37) {
              compressed = canvas.toDataURL("image/jpeg", 0.4);
            }
            const sizeKB = Math.round(compressed.length * 0.75 / 1024);
            // photo compressed
            setFormPhotos(prev => [...prev, compressed]);
          };
          wm.onerror = () => {
            let compressed = canvas.toDataURL("image/jpeg", 0.6);
            if (compressed.length > 200 * 1024 * 1.37) compressed = canvas.toDataURL("image/jpeg", 0.4);
            setFormPhotos(prev => [...prev, compressed]);
          };
          wm.src = "/logo.png";
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function pinMyLocation() {
    if (!navigator.geolocation) { alert("您的瀏覽器不支援定位"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("無法取得位置，請允許定位權限")
    );
  }

  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [translatedText, setTranslatedText] = useState("");

  async function viewAuthorProfile(uid, name, avatar) {
    try {
      const ratingsSnap = await getDocs(query(collection(db, "ratings"), where("targetUid", "==", uid)));
      const ratings = ratingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const authorPosts = posts.filter(p => p.authorUid === uid);
      const low = ratings.filter(r => r.stars <= 2).length;
      const high = ratings.filter(r => r.stars >= 4).length;
      const hidden = authorPosts.filter(p => p.hidden).length;
      const resolved = authorPosts.filter(p => p.resolved).length;
      const score = Math.max(0, Math.min(100, 100 - (low * 5) - (hidden * 3) + (resolved * 5) + (high * 3)));
      const avg = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1) : "5.0";
      setAuthorProfile({ uid, name, avatar, score, avg, ratingCount: ratings.length, postCount: authorPosts.length, resolvedCount: resolved, ratings });
    } catch(e) { console.error(e); }
  } // { photos: [], index: 0 }

  // Listen for map pin drag from Leaflet iframe
  useEffect(() => {
    function handleMapMsg(e) {
      if (e.data?.type === "mapPin") {
        setFormLocation({ lat: e.data.lat, lng: e.data.lng });
      }
      if (e.data?.type === "openPost") {
        const p = posts.find(pp => pp.id === e.data.postId);
        if (p) { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }
      }
    }
    window.addEventListener("message", handleMapMsg);
    return () => window.removeEventListener("message", handleMapMsg);
  }, [posts]);

  async function searchLocation(customQuery) {
    const q = customQuery || locationSearch;
    if (!q.trim()) return;
    setSearchingLocation(true);
    setMapSearchQuery(q);
    try {
      const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(q) + "&limit=5&accept-language=zh-TW");
      const data = await res.json();
      setLocationResults(data.map(d => ({
        name: d.display_name,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
      })));
    } catch { setLocationResults([]); }
    setSearchingLocation(false);
    setShowMapModal(true);
  }

  // Check if photo is expired (7 days)
  function isPhotoExpired(uploadDate) {
    if (!uploadDate) return false;
    return (new Date() - new Date(uploadDate)) > 15 * 86400000;
  }

  // Check if post is within 10-minute edit window
  function canEdit(p) {
    if (!p || !isOwner(p)) return false;
    const created = p.createdAt?.toDate?.() || p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : null;
    if (!created) return false;
    return (new Date() - created) < 10 * 60 * 1000; // 10 minutes
  }

  async function startEdit(p) {
    setEditingPost(p);
    setFormCat(p.category);
    setFormCatGroup(AIRPORT_CATS.includes(p.category) ? "airport" : "general");
    setFormAirport(p.airport || "");
    setFormTitle(p.title);
    setFormDesc(p.desc?.replace(/\n航班：.*$/, "") || "");
    setFormFlight(p.desc?.match(/航班：(.+)/)?.[1] || "");
    setFormDate(p.date || "");
    setFormTime(p.time || "");
    setFormReward(p.reward ? String(p.reward) : "");
    setFormWrongType(p.wrongType || ""); setFormPostType(p.postType || "");
    setFormLocationText(p.locationText || "");
    setFormLocation(p.location || null);
    setFormPhotos(p.photos || []);
    // Load verification questions and contact from private subcollection
    try {
      const privateDoc = await getDoc(doc(db, "posts", p.id, "private", "data"));
      if (privateDoc.exists()) {
        const pd = privateDoc.data();
        setFormContact(pd.contact || "");
        if (pd.verifyAnswers && p.verifyQuestions) {
          setFormVerifyQs(p.verifyQuestions.map((q, i) => ({
            q: q.q, a: pd.verifyAnswers[i] || "", custom: true
          })));
        }
      }
    } catch(e) { console.error("Load private data:", e); }
    setView("post");
  }

  async function handleUpdate() {
    if (!editingPost) return;
    const finalAirport = formAirport === "其他" ? (formCustomAirport.trim() || "其他") : formAirport;
    if (!formCat || (!formAirport && !formLocationText.trim() && !formLocation) || !formTitle || !formDesc) return;
    try {
      await updateDoc(doc(db, "posts", editingPost.id), {
        category: formCat,
        airport: finalAirport,
        title: formTitle,
        desc: formDesc + (formFlight ? "\n航班：" + formFlight : ""),
        date: formDate,
        time: formTime || null,
        reward: formReward ? parseInt(formReward) : 0,
        locationText: formLocationText || null,
        location: formLocation || null,
        photos: formPhotos,
        photosUploadedAt: formPhotos.length > 0 ? (editingPost.photosUploadedAt || new Date().toISOString()) : null,
        editedAt: serverTimestamp(),
      });
      setEditingPost(null);
      setView("feed");
      resetForm();
    } catch (e) { console.error(e); alert("編輯失敗"); }
  }

  function resetForm() {
    setFormCat(""); setFormCatGroup("airport"); setFormAirport(""); setFormContact(""); setFormContactType("line"); setUsePin(false); setFormCustomAirport(""); setFormTitle("");
    setFormDesc(""); setFormContact(""); setFormFlight(""); setFormReward(""); setFormWrongType(""); setFormPostType("");
    setFormTime(""); setFormPhotos([]); setFormLocation(null); setFormLocationText("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormVerifyQs([{ q: "", a: "", custom: false }]);
    setFormPetName(""); setFormPetGender(""); setFormPetBreed(""); setFormPetColor("");
    setFormPetFeature(""); setFormPetChip(""); setFormPetAge(""); setFormPetSize(""); setFormPetSubType("");
    setFormPetLine(""); setFormPetPhone(""); setFormPetSkipVerify(false);
    setEditingPost(null);
  }

  async function addReply(postId) {
    if (!replyText.trim()) return;
    if (readOnlyMode) { alert("⚠️ 系統為唯讀模式，暫時無法回覆。"); return; }
    if (replyText.length > 500) { alert("回覆最多 500 字"); return; }
    const p = selectedPost;
    // Mask links
    let cleanReply = maskLinks(replyText);
    if (cleanReply !== replyText) {
      alert("⚠️ 回覆中的連結已自動遮蔽為 ***\n\n為保護用戶安全，回覆不允許包含外部連結。");
    }
    // Warn scam keywords
    const scamFound = detectScamWords(cleanReply);
    if (scamFound.length > 0) {
      const count = await logScamAttempt("reply", cleanReply, scamFound);
      if (count >= 10) { alert("⛔ 您已多次觸發詐騙偵測，帳號已被限制回覆。\n如有疑問請聯繫客服。"); return; }
      if (!confirm("⚠️ 偵測到可能的敏感關鍵字：\n「" + scamFound.join("、") + "」\n\nWhat'sfind 不鼓勵在回覆中涉及金融交易資訊。\n\n⚠️ 已記錄第 " + count + " 次警告\n確定要送出嗎？")) return;
    }
    try {
      await addDoc(collection(db, "posts", postId, "replies"), {
        authorUid: user.uid, author: user.name, text: cleanReply,
        createdAt: serverTimestamp(),
      });
      // Notify post author (if not self)
      if (p && p.authorUid !== user.uid) {
        await addDoc(collection(db, "userNotifs"), {
          targetUid: p.authorUid, type: "reply", from: user.name,
          postId: p.id, postTitle: p.title, read: false,
          createdAt: serverTimestamp(),
        });
      }
      setReplyText("");
    } catch (e) { console.error("Reply error:", e); alert("回覆失敗"); }
  }

  // Listen to replies subcollection
  const [postReplies, setPostReplies] = useState([]);
  useEffect(() => {
    if (!selectedPost) { setPostReplies([]); return; }
    const unsub = onSnapshot(
      query(collection(db, "posts", selectedPost.id, "replies"), orderBy("createdAt", "asc")),
      (snap) => setPostReplies(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setPostReplies([])
    );
    return unsub;
  }, [selectedPost?.id]);

  // ─── Claim ───
  async function submitClaim() {
    if (isBlocked) { alert("您的帳號已被封鎖。"); return; }
    if (!checkRateLimit("claim")) return;
    const p = selectedPost;
    if (!p || claimAnswers.some(a => !a.trim())) return;
    try {
      const submittedAnswers = claimAnswers.map(a => a.trim().toLowerCase());

      // Auto-verify: check answers against stored private data
      let autoApproved = false;
      try {
        const privateDoc = await getDoc(doc(db, "posts", p.id, "private", "data"));
        if (privateDoc.exists() && privateDoc.data().verifyAnswers) {
          const correctAnswers = privateDoc.data().verifyAnswers;
          autoApproved = submittedAnswers.length === correctAnswers.length &&
            submittedAnswers.every((a, i) => a === correctAnswers[i]);
        }
      } catch(e) { /* private data not accessible - needs manual review */ }

      const claimRef = await addDoc(collection(db, "posts", p.id, "claims"), {
        claimantUid: user.uid, claimantName: user.name, claimantAvatar: user.avatar || null,
        postAuthorUid: p.authorUid,
        answers: submittedAnswers,
        message: claimMessage,
        status: autoApproved ? "approved" : "pending",
        autoVerified: autoApproved,
        attempts: 1,
        createdAt: serverTimestamp(),
      });

      // If auto-approved, copy contact info
      if (autoApproved) {
        try {
          const privateDoc = await getDoc(doc(db, "posts", p.id, "private", "data"));
          if (privateDoc.exists()) {
            await setDoc(doc(db, "posts", p.id, "approved", user.uid), {
              contact: privateDoc.data().contact,
              approvedAt: serverTimestamp(),
            });
          }
        } catch(e) {}
      }

      // Notify post author
      await addDoc(collection(db, "userNotifs"), {
        targetUid: p.authorUid,
        type: "claim",
        from: user.name,
        postId: p.id,
        postTitle: p.title,
        status: autoApproved ? "approved" : "pending",
        read: false,
        createdAt: serverTimestamp(),
      });
      setClaimSubmitted(true);
      if (autoApproved) {
        setClaimAutoApproved(true);
      }
    } catch (e) { console.error("Claim error:", e); alert("提交失敗"); }
  }

  async function handleClaimAction(claimDocId, action) {
    const p = selectedPost;
    try {
      await updateDoc(doc(db, "posts", p.id, "claims", claimDocId), { status: action });
      // If approved, copy contact info to approved subcollection
      if (action === "approved") {
        const privateDoc = await getDoc(doc(db, "posts", p.id, "private", "data"));
        if (privateDoc.exists()) {
          const claim = postClaims.find(c => c.id === claimDocId);
          if (claim) {
            await setDoc(doc(db, "posts", p.id, "approved", claim.claimantUid), {
              contact: privateDoc.data().contact,
              approvedAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (e) { console.error("Claim action error:", e); alert("操作失敗"); }
  }

  // ─── Chat ───
  function getChatRoomId(postId, uid1, uid2) {
    const sorted = [uid1, uid2].sort();
    return postId + "_" + sorted[0] + "_" + sorted[1];
  }

  async function openChat(targetUid, targetName, directPostId, targetAvatar) {
    const postId = directPostId || selectedPost?.id;
    if (!postId) return;
    const roomId = getChatRoomId(postId, user.uid, targetUid);
    setChatRoomId(roomId);
    setChatTarget({ uid: targetUid, name: targetName, avatar: targetAvatar || null });
    currentChatRoomRef.current = roomId;
    // Track this chat room
    setActiveChats(prev => {
      if (prev.some(c => c.roomId === roomId)) return prev.map(c => c.roomId === roomId ? { ...c, unread: 0 } : c);
      return [...prev, { roomId, postId, targetUid, targetName, targetAvatar: targetAvatar || null, lastMsg: "", unread: 0, msgCount: 0 }];
    });
    setView("chat");
  }

  const chatRoomMsgCounts = useRef({});

  // Subscribe to all active chat rooms for unread tracking
  const activeRoomIdsRef = useRef("");
  useEffect(() => {
    const roomIdStr = activeChats.map(c => c.roomId).sort().join(",");
    if (roomIdStr === activeRoomIdsRef.current) return; // no change in rooms
    activeRoomIdsRef.current = roomIdStr;
    if (!user || activeChats.length === 0) return;
    const roomIds = activeChats.map(c => c.roomId);
    const unsubs = roomIds.map(roomId => {
      const q = query(collection(db, "chats", roomId, "messages"), orderBy("createdAt", "asc"));
      let isFirstLoad = true;
      return onSnapshot(q, (snap) => {
        const count = snap.size;
        const latest = count > 0 ? snap.docs[count - 1].data() : null;
        if (isFirstLoad) {
          chatRoomMsgCounts.current[roomId] = count;
          isFirstLoad = false;
          if (latest) {
            setActiveChats(prev => prev.map(c => c.roomId === roomId ? { ...c, lastMsg: latest.text || "", lastMsgAt: Date.now() } : c));
          }
          return;
        }
        const prevCount = chatRoomMsgCounts.current[roomId] || 0;
        const newMsgs = count - prevCount;
        chatRoomMsgCounts.current[roomId] = count;
        if (newMsgs > 0 && latest && latest.from !== user.uid && currentChatRoomRef.current !== roomId) {
          setActiveChats(prev => prev.map(c => c.roomId === roomId ? { ...c, lastMsg: latest.text || "", lastMsgAt: Date.now(), unread: (c.unread || 0) + newMsgs } : c));
          // Browser notification (respects preferences)
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && notifPrefEnabled("chat")) {
            const chat = activeChats.find(c => c.roomId === roomId);
            const n = new Notification("What'sfind", { body: (latest.fromName || chat?.targetName || "對方") + "：" + latest.text });
            n.onclick = () => { window.focus(); };
          }
          // In-app notification
          const chat = activeChats.find(c => c.roomId === roomId);
          setNotifications(prev => [{ id: Date.now() + Math.random(), type: "chat", from: latest.fromName || chat?.targetName || "對方", postTitle: "即時訊息", time: new Date().toLocaleString("zh-TW"), roomId, targetUid: latest.from, targetName: latest.fromName || chat?.targetName || "對方", postId: chat?.postId }, ...prev]);
          // Ensure chat room is in activeChats
          setActiveChats(prev => {
            if (prev.some(c => c.roomId === roomId)) return prev.map(c => c.roomId === roomId ? { ...c, lastMsg: latest.text || "", unread: (c.unread || 0) + newMsgs } : c);
            return [...prev, { roomId, postId: chat?.postId, targetUid: latest.from, targetName: latest.fromName || "對方", targetAvatar: null, lastMsg: latest.text || "", unread: newMsgs, msgCount: 0 }];
          });
        } else if (latest) {
          setActiveChats(prev => prev.map(c => c.roomId === roomId ? { ...c, lastMsg: latest.text || "", lastMsgAt: Date.now() } : c));
        }
      });
    });
    return () => unsubs.forEach(u => u());
  }, [activeChats, user?.uid]);

  // Reset unread when entering a chat
  useEffect(() => {
    if (view === "chat" && chatRoomId) {
      currentChatRoomRef.current = chatRoomId;
      setActiveChats(prev => prev.map(c => c.roomId === chatRoomId ? { ...c, unread: 0 } : c));
    } else {
      currentChatRoomRef.current = null;
    }
  }, [view, chatRoomId]);

  const totalChatUnread = activeChats.reduce((sum, c) => sum + (c.unread || 0), 0)
    + notifications.filter(n => n.type === "chat").length;

  // Update app badge on home screen
  useEffect(() => {
    const total = unreadCount + totalChatUnread;
    try {
      if (navigator.setAppBadge) {
        if (total > 0) navigator.setAppBadge(total);
        else navigator.clearAppBadge();
      }
    } catch(e) {}
  }, [unreadCount, totalChatUnread]);

  // Chat view height for mobile keyboard handling
  const [chatViewHeight, setChatViewHeight] = useState("100dvh");
  const [chatViewTop, setChatViewTop] = useState(0);
  const [showTutorial, setShowTutorial] = useState(() => {
    try { return !localStorage.getItem("lf_tutorial_done"); } catch { return true; }
  });
  const [tutorialStep, setTutorialStep] = useState(-1);
  const introVideoRef = useRef(null);
  useEffect(() => {
    if (view !== "chat") return;
    function handleResize() {
      if (window.visualViewport) {
        setChatViewHeight(window.visualViewport.height + "px");
        setChatViewTop(0);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize();
    }
    // Prevent body scroll when keyboard opens
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = "0";
    document.body.style.background = "#F0F4F8";
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.background = "";
    };
  }, [view]);

  useEffect(() => {
    if (view === "chat" && chatRoomId) {
      const unsub = subscribeToChatRoom(chatRoomId);
      return unsub;
    }
  }, [view, chatRoomId]);

  useEffect(() => {
    if (view === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, view]);

  // Link/scam detection
  function maskLinks(text) {
    return text.replace(/https?:\/\/\S+/gi, "***").replace(/www\.\S+/gi, "***").replace(/bit\.ly\/\S+/gi, "***").replace(/reurl\.cc\/\S+/gi, "***").replace(/tinyurl\.\S+/gi, "***").replace(/goo\.gl\/\S+/gi, "***");
  }
  // Normalize text to catch variants (full-width, spacing, homophones)
  function normalizeText(text) {
    return text
      .replace(/[\s\-_.·、，。！？~*+=]/g, "")  // remove separators
      .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248))  // full-width numbers
      .replace(/[Ａ-Ｚａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248))  // full-width letters
      .toLowerCase()
      // Common homophone/variant substitutions
      .replace(/匯欵|匯款|滙款|匯歀|賄款|回款|會款|悔款|繪款|燴款|穢款|彙款/g, "匯款")
      .replace(/轉帳|轉賬|轉ㄓㄤ|轉張|轉章|轉漲|傳帳|磚帳/g, "轉帳")
      .replace(/帳號|賬號|帳户|帳戶|帳号|賬户|漲號|張號/g, "帳號")
      .replace(/賴|line|LINE|ㄌㄞ|萊恩|賴賴/g, "line")
      .replace(/微信|weixin|wechat|威信|唯信/g, "微信")
      .replace(/密碼|password|pwd|ㄇㄧˋㄇㄚˇ|密瑪|蜜碼/g, "密碼")
      .replace(/銀行|銀航|印行|銀珩/g, "銀行")
      .replace(/付款|副款|富款|傅款/g, "付款")
      .replace(/收款|受款|手款|首款/g, "收款")
      .replace(/現金|線金|限金|獻金/g, "現金");
  }
  function detectScamWords(text) {
    const normalized = normalizeText(text);
    const scamWords = ["轉帳", "匯款", "帳號", "銀行", "atm", "信用卡", "提款", "驗證碼", "中獎", "得獎", "領獎", "免費", "加line", "私訊我", "點擊連結", "虛擬貨幣", "加密貨幣", "usdt", "投資", "代付", "代收", "借錢", "身分證", "密碼", "otp", "手機號碼", "先付款", "押金", "保證金", "運費", "手續費", "限時", "telegram", "tg群", "微信", "whatsapp", "支付寶", "現金", "紅包"];
    const found = scamWords.filter(w => normalized.includes(normalizeText(w)));
    // Pattern-based: any character + 款/帳/賬 (catches 賄款, 匯欵, 給款...)
    const moneyPattern = /[\u4e00-\u9fff][款帳賬歀欵]/g;
    const patternMatches = normalized.match(moneyPattern);
    if (patternMatches) {
      patternMatches.forEach(m => { if (!found.includes(m)) found.push(m); });
    }
    // Pattern: numbers that look like account numbers (8+ consecutive digits)
    if (/\d{8,}/.test(normalized)) {
      found.push("疑似帳號數字");
    }
    return found;
  }
  function hasLinks(text) {
    return /https?:\/\/\S+|www\.\S+|bit\.ly|reurl\.cc|tinyurl|goo\.gl/i.test(text);
  }

  // Track scam attempts per user
  async function logScamAttempt(type, content, keywords) {
    if (!user) return 0;
    if (isRealAdmin) return 0;  // Admin exempt from scam tracking
    try {
      await addDoc(collection(db, "scamLogs"), {
        uid: user.uid, name: user.name, type,
        content: content.slice(0, 200), keywords,
        createdAt: serverTimestamp(),
      });
      // Count recent attempts
      const snap = await getDocs(query(
        collection(db, "scamLogs"),
        where("uid", "==", user.uid)
      ));
      const count = snap.size;
      if (count >= 5) {
        // Notify admin of repeat offender
        for (const adminUid of ADMIN_UIDS) {
          await addDoc(collection(db, "userNotifs"), {
            targetUid: adminUid, type: "scam_alert", from: user.name,
            postId: "", postTitle: "⚠️ 用戶「" + user.name + "」已觸發詐騙偵測 " + count + " 次", read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
      return count;
    } catch(e) { return 0; }
  }

  async function sendChat() {
    if (!chatInput.trim() || !chatRoomId || !chatTarget) return;
    if (readOnlyMode) { alert("⚠️ 系統為唯讀模式，暫時無法發送訊息。"); return; }
    if (chatInput.length > 500) { alert("訊息最多 500 字"); return; }
    // Mask links automatically
    let msgText = maskLinks(chatInput);
    const linksFound = msgText !== chatInput;
    if (linksFound) { alert("⚠️ 訊息中的連結已自動遮蔽為 ***\n\n為保護雙方安全，聊天室不允許傳送連結。"); }
    // Warn scam keywords
    const scamFound = detectScamWords(msgText);
    if (scamFound.length > 0) {
      const count = await logScamAttempt("chat", msgText, scamFound);
      if (count >= 10) { alert("⛔ 您已多次觸發詐騙偵測，帳號已被限制發送訊息。\n如有疑問請聯繫客服。"); return; }
      if (!confirm("⚠️ 偵測到可能的敏感關鍵字：\n「" + scamFound.join("、") + "」\n\nWhat'sfind 不鼓勵在聊天中涉及金融交易。\n\n⚠️ 已記錄第 " + count + " 次警告\n確定要送出嗎？")) return;
    }
    await addDoc(collection(db, "chats", chatRoomId, "messages"), {
      from: user.uid, fromName: user.name, fromAvatar: user.avatar || null,
      text: msgText, createdAt: serverTimestamp(),
    });
    // Update chat list timestamp
    setActiveChats(prev => prev.map(c => c.roomId === chatRoomId ? { ...c, lastMsg: msgText, lastMsgAt: Date.now() } : c));
    // Notify the other person via userNotifs
    if (chatTarget.uid === "test_bot") {
      // Test bot auto-reply
      const botReplies = ["收到！這是測試回覆 ✅", "訊息功能正常運作中 👍", "你好！我是測試機器人 🤖", "已讀 ✓✓", "測試完成！一切正常 🎉", "收到你的訊息了！" + new Date().toLocaleTimeString("zh-TW")];
      setTimeout(async () => {
        await addDoc(collection(db, "chats", chatRoomId, "messages"), {
          from: "test_bot", fromName: "🤖 測試機器人", fromAvatar: null,
          text: botReplies[Math.floor(Math.random() * botReplies.length)], createdAt: serverTimestamp(),
        });
      }, 800 + Math.random() * 1200);
    } else {
      try {
      await addDoc(collection(db, "userNotifs"), {
        targetUid: chatTarget.uid,
        type: "chat",
        from: user.name,
        postId: selectedPost?.id || "",
        postTitle: chatInput.slice(0, 30),
        roomId: chatRoomId,
        targetName: user.name,
        targetUidSender: user.uid,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error("Chat notif error:", e); }
    }
    setChatInput("");
  }

  // ─── Resolve ───
  const [totalResolved, setTotalResolved] = useState(0);

  // Listen to persistent stats
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "stats", "global"), (snap) => {
      if (snap.exists()) {
        setTotalResolved(snap.data().totalResolved || 0);
      }
    }, () => {});
    return unsub;
  }, []);

  async function confirmResolve() {
    await updateDoc(doc(db, "posts", selectedPost.id), { resolved: true, resolvedAt: serverTimestamp() });
    // Increment persistent counter
    try {
      await setDoc(doc(db, "stats", "global"), { totalResolved: increment(1) }, { merge: true });
    } catch (e) { console.error("Stats update failed:", e); }
    setResolveStep("handover");
  }

  // ─── Verify Q helpers ───
  function addVerifyQ() { if (formVerifyQs.length < 3) setFormVerifyQs(prev => [...prev, { q: "", a: "", custom: false }]); }
  function removeVerifyQ(idx) { setFormVerifyQs(prev => prev.filter((_, i) => i !== idx)); }
  function updateVerifyQ(idx, field, val) { setFormVerifyQs(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item)); }
  function selectHintQ(idx, hint) {
    if (hint === "自訂問題⋯") {
      setFormVerifyQs(prev => prev.map((item, i) => i === idx ? { ...item, q: "", custom: true } : item));
    } else {
      setFormVerifyQs(prev => prev.map((item, i) => i === idx ? { ...item, q: hint, custom: false } : item));
    }
  }

  const contactVisible = (p) => isOwner(p) ? !!ownerContact : isAdmin ? !!ownerContact : !!approvedContact;
  const getContactInfo = (p) => isOwner(p) || isAdmin ? ownerContact : approvedContact;
  const hasPendingClaim = (p) => postClaims.some(c => c.claimantUid === user?.uid && c.status === "pending");
  const hasApprovedClaim = (p) => !!approvedContact || postClaims.some(c => c.claimantUid === user?.uid && c.status === "approved");
  const pendingCount = (p) => postClaims.filter(c => c.status === "pending").length;

  const tutorialPages = [
    { icon: "🔍", title: t.tut1, desc: t.tut1d, color: "#1B4965", features: ["📦 " + t.itemMode, "🐾 " + t.petMode, "🆓 Free"] },
    { icon: "📝", title: t.tut2, desc: t.tut2d, color: "#E05A33", features: ["📷 " + t.photo, "🗺️ " + t.location, "📍 GPS"] },
    { icon: "🛡️", title: t.tut3, desc: t.tut3d, color: "#D4880F", features: ["🔑 " + t.verifyQ, "🔒 " + t.contact, "📄 " + t.done] },
    { icon: "🐾", title: t.tut4, desc: t.tut4d, color: "#7B4BB2", features: ["🐕 / 🐈 / 🐦", "📢 SNS", "📍 GPS"] },
    { icon: "🔒", title: t.tut5, desc: t.tut5d, color: "#C62828", features: ["🚫 ***", "⚠️ " + t.reportBtn, "🚩 165"] },
    { icon: "💬", title: t.tut6, desc: t.tut6d, color: "#2D8A5E", features: ["🔔 " + t.notifications, "💬 Chat", "⭐ " + t.done] },
    { icon: "📱", title: t.tut7, desc: t.tut7d, color: "#00838F", features: ["📲 PWA", "🌐 4 Lang", "☕ " + t.donate] },
  ];

  function closeTutorial() {
    try { localStorage.setItem("lf_tutorial_done", "1"); } catch {}
    setShowTutorial(false);
    setTutorialStep(-1);
    setView("feed");
    setFeedMode("list");
    setBottomTab("home");
    window.scrollTo(0, 0);
  }

  // ─── Stale post reminder (must be before conditional returns) ───
  const [staleReminded, setStaleReminded] = useState(false);
  useEffect(() => {
    if (!user || staleReminded || !posts.length || showTutorial) return;
    // 48h auto-resolve for handover
    posts.forEach(async (p) => {
      if (p.handoverInitiated && !p.resolved && p.handoverInitiatedAt) {
        const initiatedTime = p.handoverInitiatedAt?.toDate?.() || new Date(p.handoverInitiatedAt);
        const hoursSince = (Date.now() - initiatedTime.getTime()) / 3600000;
        if (hoursSince >= 48) {
          try { await updateDoc(doc(db, "posts", p.id), { resolved: true, resolvedAt: serverTimestamp(), resolvedBy: "auto_48h" }); } catch {}
        }
      }
      // Auto-unpin expired pins
      if (p.pinned && p.pinnedUntil) {
        if (new Date(p.pinnedUntil) < new Date()) {
          try { await updateDoc(doc(db, "posts", p.id), { pinned: false, pinnedUntil: null }); } catch {}
        }
      }
    });
    const myStale = posts.filter(p => p.authorUid === user.uid && !p.resolved && !p.hidden && !isExpired(p));
    const needRemind = myStale.filter(p => postAgeDays(p) >= 7);
    if (needRemind.length > 0) {
      setStaleReminded(true);
      const titles = needRemind.map(p => "• " + p.title + "（" + postAgeDays(p) + " 天前）").join("\n");
      setTimeout(() => {
        const action = confirm("📢 您有 " + needRemind.length + " 篇貼文還在尋找中：\n\n" + titles + "\n\n請問已經找到了嗎？\n\n按「確定」前往處理\n按「取消」稍後再說");
        if (action) { setView("profile"); setBottomTab("profile"); }
      }, 5000);
    }
  }, [user, posts, staleReminded, showTutorial]);

  // PWA Install Banner
  const installBanner = showInstallBanner && !isStandalone && (
    <div style={{ position: "fixed", bottom: 90, left: 12, right: 12, maxWidth: 700, margin: "0 auto", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", borderRadius: 16, padding: "14px 16px", boxShadow: "0 8px 32px rgba(27,73,101,0.4)", zIndex: 9998, animation: "slideUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/icon-192.png" alt="" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>📱 加到主畫面</div>
          <div style={{ fontSize: 11, color: "#A8D0E6", marginTop: 2 }}>
            {isIOS ? "點下方分享 → 加入主畫面" : "一鍵安裝，像 App 一樣使用"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {!isIOS && installPrompt && (
            <button onClick={triggerInstall} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#fff", color: "#1B4965", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>安裝</button>
          )}
          {isIOS && (
            <button onClick={() => alert("📱 iPhone 安裝步驟：\n\n1. 點畫面下方的「分享」按鈕 ⬆️\n2. 向下滑動找到「加入主畫面」\n3. 點右上角「新增」\n\n完成後桌面就會出現 What'sfind 圖示！")} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#fff", color: "#1B4965", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>教學</button>
          )}
          <button onClick={dismissInstall} style={{ padding: "8px 10px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}>✕</button>
        </div>
      </div>
    </div>
  );

  // Shelter detail fullscreen modal
  const shelterDetailModal = selectedShelter && (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#fff", zIndex: 10000, display: "flex", flexDirection: "column" }}>
      <header style={{ ...S.header, flexShrink: 0 }}>
        <button onClick={() => setSelectedShelter(null)} style={S.backBtn}>← 返回</button>
        <span style={{ ...S.headerTitle, fontSize: 15 }}>🏠 {selectedShelter.name}</span>
        <span style={{ width: 48 }} />
      </header>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#F0F4F8" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#7B4BB2", marginBottom: 8 }}>{selectedShelter.name}</div>
          {selectedShelter.addr && <div style={{ fontSize: 12, color: "#5A7184", marginBottom: 4 }}>📮 {selectedShelter.addr}</div>}
          <div style={{ fontSize: 12, color: "#5A7184", marginBottom: 8 }}>
            🐕 {selectedShelter.animals.filter(a => a.animal_kind === "狗").length} 隻狗 ·
            🐈 {selectedShelter.animals.filter(a => a.animal_kind === "貓").length} 隻貓 ·
            共 <strong style={{ color: "#E05A33" }}>{selectedShelter.animals.length}</strong> 隻
          </div>
          {selectedShelter.tel && <a href={"tel:" + selectedShelter.tel} style={{ display: "block", padding: "10px", borderRadius: 10, background: "#7B4BB2", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>📞 {selectedShelter.tel}</a>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {selectedShelter.animals.map((a, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {a.album_file ? (
                <img src={proxyImg(a.album_file)} alt="" style={{ width: "100%", height: 130, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ width: "100%", height: 130, background: "#F3E5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{a.animal_kind === "貓" ? "🐈" : "🐕"}</div>
              )}
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965" }}>
                  {a.animal_kind} {a.animal_sex === "M" ? "♂" : a.animal_sex === "F" ? "♀" : ""} {a.animal_bodytype === "SMALL" ? "小型" : a.animal_bodytype === "MEDIUM" ? "中型" : a.animal_bodytype === "BIG" ? "大型" : ""}
                </div>
                <div style={{ fontSize: 11, color: "#5A7184", marginTop: 3 }}>🎨 {a.animal_colour || "—"}</div>
                <div style={{ fontSize: 11, color: "#5A7184" }}>📍 {(a.animal_foundplace || "—").substring(0, 15)}</div>
                <div style={{ fontSize: 10, color: "#8896A6", marginTop: 4 }}>
                  {a.animal_sterilization === "T" ? "✅ 已絕育" : "❌ 未絕育"}
                  {a.animal_bacterin === "T" ? " · 💉 已疫苗" : ""}
                </div>
                {a.animal_opendate && <div style={{ fontSize: 10, color: "#B0BEC5" }}>入所：{a.animal_opendate}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#8896A6", textAlign: "center", marginTop: 16, paddingBottom: 20 }}>資料來源：農業部動物認領養開放平台</div>
      </div>
    </div>
  );

  // Shelter animals modal
  const shelterModal = showShelterMatch && (
    <div onClick={() => setShowShelterMatch(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 600, maxHeight: "85vh", background: "#fff", borderRadius: "24px 24px 0 0", padding: "16px 16px 24px", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, background: "#DDE4EC", borderRadius: 2, margin: "0 auto 14px" }} />
        <div style={{ fontSize: 18, fontWeight: 900, color: "#1B4965", textAlign: "center", marginBottom: 4 }}>🏠 收容所動物</div>
        <div style={{ fontSize: 11, color: "#8896A6", textAlign: "center", marginBottom: 16 }}>資料來源：農業部動物認領養開放平台</div>

        {shelterLoading && <div style={{ textAlign: "center", padding: 40 }}><div style={S.spinner} /><p style={{ color: "#5A7184", marginTop: 16, fontSize: 13 }}>搜尋中...</p></div>}

        {!shelterLoading && shelterAnimals.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#8896A6" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <p style={{ fontSize: 14 }}>目前附近收容所沒有相符的動物</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>建議直接聯繫當地動物收容所詢問</p>
          </div>
        )}

        {!shelterLoading && shelterAnimals.length > 0 && (
          <>
            <div style={{ fontSize: 13, color: "#5A7184", marginBottom: 12, textAlign: "center" }}>找到 <strong style={{ color: "#7B4BB2" }}>{shelterAnimals.length}</strong> 隻可能相符的動物</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {shelterAnimals.map((a, i) => (
                <div key={i} style={{ background: "#F7F9FC", borderRadius: 12, overflow: "hidden", border: "1.5px solid #EEF2F7" }}>
                  {a.album_file ? (
                    <img src={proxyImg(a.album_file)} alt="" style={{ width: "100%", height: 120, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: "100%", height: 120, background: "#EEF2F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{a.animal_kind === "貓" ? "🐈" : "🐕"}</div>
                  )}
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1B4965" }}>{a.animal_kind} · {a.animal_sex === "M" ? "公" : a.animal_sex === "F" ? "母" : "?"} · {a.animal_bodytype === "SMALL" ? "小型" : a.animal_bodytype === "MEDIUM" ? "中型" : a.animal_bodytype === "BIG" ? "大型" : ""}</div>
                    <div style={{ fontSize: 11, color: "#5A7184", marginTop: 3 }}>🎨 {a.animal_colour || "—"}</div>
                    <div style={{ fontSize: 11, color: "#5A7184" }}>📍 {a.animal_foundplace || "—"}</div>
                    <div style={{ fontSize: 10, color: "#8896A6", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.shelter_name}</div>
                    {a.shelter_tel && <a href={"tel:" + a.shelter_tel} style={{ display: "block", marginTop: 6, padding: "5px", borderRadius: 6, background: "#7B4BB2", color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>📞 聯繫收容所</a>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={() => setShowShelterMatch(false)} style={{ width: "100%", padding: 14, marginTop: 16, borderRadius: 12, border: "none", background: "#F7F9FC", color: "#5A7184", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>關閉</button>
      </div>
    </div>
  );

  // ═══ BOTTOM NAV (reusable) ═══
  const bottomNavBar = (
      <div style={{ ...S.bottomNav, maxWidth: desktopWide ? "100%" : 720 }}>
        <button onClick={() => { setView("feed"); setFeedMode("list"); }} style={S.navItem}>
          <img src="/nav-home.png?v=3" alt="" style={{ width: 30, height: 30, opacity: view === "feed" && feedMode === "list" ? 1 : 0.5 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>首頁</span>
        </button>
        <button onClick={() => {
          setView("feed"); setFeedMode("map");
          if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                const sorted = [...AIRPORTS_DATA]
                  .map(a => ({ ...a, dist: getDistance(pos.coords.latitude, pos.coords.longitude, a.lat, a.lng) }))
                  .sort((a, b) => a.dist - b.dist);
                setSortedAirports(sorted.map(a => a.name));
              },
              () => {}
            );
          }
        }} style={S.navItem}>
          <img src="/nav-map.png?v=3" alt="" style={{ width: 30, height: 30, opacity: view === "feed" && feedMode === "map" ? 1 : 0.5 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>地圖</span>
        </button>
        <button onClick={() => {
          if (!user) { setView("login"); return; }
          if (view !== "feed") { setView("feed"); setFeedMode("list"); }
          setShowPostPopup(!showPostPopup);
        }} style={S.navPostBtn}>
          <img src="/nav-plus.png?v=3" alt="發布" style={{ width: 52, height: 52, objectFit: "contain" }} />
        </button>
        <button onClick={() => {
          if (!user) { setView("login"); return; }
          if (view !== "feed") { setView("feed"); setFeedMode("list"); }
          setShowChatList(!showChatList);
          if (!showChatList) {
            // Only clear notification badge, keep unread markers in list
            setNotifications(prev => prev.filter(n => n.type !== "chat"));
            notifications.filter(n => n.type === "chat").forEach(n => {
              updateDoc(doc(db, "userNotifs", n.id), { read: true }).catch(() => {});
            });
          }
        }} style={S.navItem}>
          <div style={{ position: "relative" }}>
            <img src="/nav-msg.png?v=3" alt="" style={{ width: 30, height: 30, opacity: showChatList ? 1 : 0.5 }} />
            {totalChatUnread > 0 && <span style={{ position: "absolute", top: -6, right: -12, background: "#E05A33", color: "#fff", fontSize: 11, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", boxShadow: "0 1px 4px rgba(224,90,51,0.4)" }}>{totalChatUnread}</span>}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>訊息</span>
        </button>
        <button onClick={() => { if (!user) { setView("login"); return; } setView("profile"); }} style={S.navItem}>
          <img src="/nav-profile.png?v=3" alt="" style={{ width: 30, height: 30, opacity: view === "profile" ? 1 : 0.6 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>個人</span>
        </button>
      </div>
  );

  // ═══ TUTORIAL VIDEO MODAL (renders on any view) ═══
  const [tVidStep, setTVidStep] = useState(0);
  const tNarrations = [
    "如果你想在 What's find 上找東西，或幫走失的寵物找主人，其實操作很簡單，我帶你快速看一次。",
    "先用 Google 登入帳號，然後按下方中間的加號，就可以開始發文了。",
    "選擇你要找遺失物，或是協尋寵物。",
    "接著選擇類別，像是行李、錢包、證件，或是狗、貓、鳥這些寵物類別。",
    "把地點、詳細特徵和照片填好，找回來的機會更高。如果有照片，記得一起上傳。",
    "接著設定驗證問題，這樣可以避免別人冒領。",
    "設定好防冒領問題與聯絡方式，確認沒問題就可以直接發佈了！",
    "這樣更多人就能幫你一起找回遺失物，也能更快協尋到走失的寵物。",
  ];
  useEffect(() => {
    if (!showTutorialVideo) return;
    setTVidStep(0);
    // Speak function that returns a promise, resolves when speech ends
    const speak = (text) => new Promise((resolve) => {
      if (!window.speechSynthesis) { setTimeout(resolve, 3000); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-TW"; u.rate = 0.92; u.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang.includes("zh-TW")) || voices.find(v => v.lang.includes("zh"));
      if (v) u.voice = v;
      u.onend = () => setTimeout(resolve, 500); // 講完後停 0.5 秒再切換
      u.onerror = () => setTimeout(resolve, 2000);
      window.speechSynthesis.speak(u);
    });
    // Play scenes sequentially - wait for speech to finish before next scene
    let cancelled = false;
    (async () => {
      for (let i = 0; i < tNarrations.length; i++) {
        if (cancelled) break;
        setTVidStep(i);
        await speak(tNarrations[i]);
        while (!cancelled) {
          const p = document.querySelector("[data-tvid-paused]");
          if (!p || p.dataset.tvidPaused !== "true") break;
          await new Promise(r => setTimeout(r, 200));
        }
      }
      if (!cancelled) setTVidPaused(true);
    })();
    return () => { cancelled = true; window.speechSynthesis?.cancel(); };
  }, [showTutorialVideo]);

  const tScenes = [
    { caption: "3分鐘學會 What'sfind 發文 🚀", content: <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🔍</div><div style={{fontSize:22,fontWeight:900,color:"#1B4965",marginBottom:6}}>What'sfind</div><div style={{fontSize:13,color:"#5A7184",lineHeight:2}}>防冒領遺失物互助平台<br/>免費 · 安全 · 即時聊天<br/>🐾 走失寵物協尋</div></div> },
    { caption: "Google 免費登入 ➔ 點擊「＋」", content: <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:"#1B4965",marginBottom:16}}>Step 1：登入 & 發文</div><div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#5A7184",marginBottom:6}}>① 點右上角</div><div style={{padding:"8px 16px",background:"#fff",borderRadius:10,fontSize:12,fontWeight:700,color:"#1B4965",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>🔑 Google 登入</div></div><div style={{fontSize:20,color:"#8896A6"}}>→</div><div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#5A7184",marginBottom:6}}>② 點底部</div><div style={{width:40,height:40,background:"linear-gradient(135deg,#E05A33,#E9A825)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,margin:"0 auto"}}>＋</div></div></div></div> },
    { caption: "選擇模式：尋物 📦 / 尋寵 🐾", content: <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:"#1B4965",marginBottom:14}}>Step 2：選擇模式</div><div style={{display:"flex",gap:10}}><div style={{flex:1,padding:12,borderRadius:12,border:"2.5px solid #1B4965",background:"#1B496508",textAlign:"center"}}><div style={{fontSize:24}}>📦</div><div style={{fontSize:13,fontWeight:700,color:"#1B4965"}}>尋物</div></div><div style={{flex:1,padding:12,borderRadius:12,border:"2.5px solid #7B4BB2",background:"#7B4BB208",textAlign:"center"}}><div style={{fontSize:24}}>🐾</div><div style={{fontSize:13,fontWeight:700,color:"#7B4BB2"}}>尋寵</div></div></div></div> },
    { caption: "精準分類（行李 / 錢包 / 寵物）", content: <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{[["🧳","行李"],["🔄","誤取"],["🔍","拾獲"],["👛","錢包"],["📇","證件"],["📱","3C"],["🐕","狗"],["🐈","貓"],["🐦","鳥"]].map(([icon,name],i)=><div key={i} style={{background:"#fff",borderRadius:10,padding:"8px 4px",textAlign:"center",border:i===0?"2px solid #E05A33":"1.5px solid #EEF2F7",fontSize:11,color:i===0?"#E05A33":"#5A7184",fontWeight:i===0?700:400}}><div style={{fontSize:20}}>{icon}</div>{name}</div>)}</div></div> },
    { caption: "填寫地點標題 📍 ＋ 附上照片 📸", content: <div>{[["📍 地點","桃園國際機場 (TPE)"],["📋 標題","黑色 Rimowa 行李箱"],["📝 描述","28吋黑色，箱身有綠色束帶..."]].map(([l,v],i)=><div key={i} style={{background:"#fff",borderRadius:10,padding:"8px 12px",marginBottom:6,border:"1.5px solid #EEF2F7"}}><div style={{fontSize:10,color:"#8896A6"}}>{l}</div><div style={{fontSize:12,color:"#1B4965",fontWeight:700}}>{v}</div></div>)}<div style={{display:"flex",gap:6,marginTop:4}}><div style={{width:40,height:40,background:"#2D8A5E20",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✅</div><div style={{width:40,height:40,background:"#2D8A5E20",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✅</div><div style={{width:40,height:40,border:"1.5px dashed #DDE4EC",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#8896A6"}}>＋</div></div></div> },
    { caption: "🛡️ 設定防冒領問題（超重要！）", content: <div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:8}}>🛡️</div><div style={{fontSize:15,fontWeight:900,color:"#1B4965",marginBottom:12}}>設定驗證問題</div>{["行李條號碼最後4碼？","密碼鎖的號碼是？"].map((q,i)=><div key={i} style={{background:"#fff",borderRadius:10,padding:"10px 12px",borderLeft:"4px solid #2D8A5E",marginBottom:6,textAlign:"left"}}><div style={{fontSize:10,color:"#2D8A5E",fontWeight:700}}>問題 {i+1}</div><div style={{fontSize:12,color:"#1B4965",fontWeight:700}}>{q}</div></div>)}<div style={{fontSize:12,color:"#5A7184",marginTop:8}}>只有真正失主能回答 ✅</div></div> },
    { caption: "聯絡資訊隱私保護 🔒 ➔ 發佈！", content: <div style={{textAlign:"center"}}><div style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:12,border:"1.5px solid #EEF2F7"}}><div style={{fontSize:10,color:"#8896A6",marginBottom:4}}>📞 聯絡方式</div><div style={{display:"flex",gap:6}}><div style={{padding:"4px 12px",background:"#2D8A5E10",borderRadius:6,fontSize:11,color:"#2D8A5E",fontWeight:700}}>LINE ✓</div><div style={{padding:"4px 12px",background:"#F7F9FC",borderRadius:6,fontSize:11,color:"#8896A6"}}>Email</div></div><div style={{fontSize:10,color:"#8896A6",marginTop:6}}>🔒 只有通過驗證才看得到</div></div><div style={{padding:12,background:"linear-gradient(135deg,#1B4965,#2D6E9E)",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800}}>📤 發佈留言</div><div style={{marginTop:10,fontSize:24}}>🎉 🎊 ✨</div></div> },
    { caption: "互助協尋 · 讓失物早點回家 🏠", content: <div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🏠</div><div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:8}}>互助協尋</div><div style={{fontSize:14,color:"#A8D0E6",lineHeight:2}}>✅ 免費　🛡️ 防冒領<br/>💬 聊天　📦 紀錄單<br/>🌍 52機場　🐾 寵物</div><div style={{marginTop:14,padding:"10px 24px",border:"2px solid #fff",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,display:"inline-block"}}>whatsfind-app.vercel.app</div></div> },
  ];

  const [tVidPaused, setTVidPaused] = useState(false);

  const tutorialVideoModal = showTutorialVideo && (
    <div onClick={() => setShowTutorialVideo(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, backdropFilter: "blur(4px)" }}>
      {/* Close button - outside video */}
      <button onClick={() => { setShowTutorialVideo(false); setTVidPaused(false); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>✕</button>

      {/* Video content */}
      <div onClick={e => e.stopPropagation()} data-tvid-paused={tVidPaused ? "true" : "false"} style={{ position: "relative", width: 280, borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", background: tVidStep === 7 ? "linear-gradient(135deg,#1B4965,#2D6E9E)" : "#F0F4F8" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#2D8A5E,#E9A825)", width: ((tVidStep + 1) / tScenes.length * 100) + "%", transition: "width 0.5s" }} />
        <div style={{ padding: 20, minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {tScenes[tVidStep]?.content}
        </div>
        <div style={{ padding: "10px 16px", background: "rgba(27,73,101,0.95)", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {/* Play/Pause button */}
          <button onClick={() => {
            if (tVidPaused) {
              setTVidPaused(false);
              window.speechSynthesis?.resume();
            } else {
              setTVidPaused(true);
              window.speechSynthesis?.pause();
            }
          }} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tVidPaused ? "▶" : "⏸"}</button>
          <span style={{ flex: 1 }}>{tScenes[tVidStep]?.caption}</span>
        </div>
      </div>
    </div>
  );

  // ═══ TUTORIAL ═══

  // Post type popup - floating buttons from + button
  const postPopupModal = showPostPopup && (
    <div onClick={() => setShowPostPopup(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}>
      <div onClick={(e) => { e.stopPropagation(); setShowPostPopup(false); setAppMode("item"); setView("post"); }} style={{ position: "fixed", bottom: 95, left: "calc(50% - 100px)", padding: "8px 14px", borderRadius: 12, background: "#1B4965", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(27,73,101,0.4)", whiteSpace: "nowrap", zIndex: 9999 }}>📦 發布尋物</div>
      <div onClick={(e) => { e.stopPropagation(); setShowPostPopup(false); setAppMode("pet"); setView("post"); }} style={{ position: "fixed", bottom: 95, left: "calc(50% + 16px)", padding: "8px 14px", borderRadius: 12, background: "#2D8A5E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,138,94,0.4)", whiteSpace: "nowrap", zIndex: 9999 }}>🐾 發布尋寵</div>
    </div>
  );
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  function handleTouchStart(e) { touchStartX.current = e.changedTouches[0].screenX; }
  function handleTouchEnd(e) {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && tutorialStep < tutorialPages.length - 1) setTutorialStep(s => s + 1);
      if (diff < 0 && tutorialStep > 0) setTutorialStep(s => s - 1);
    }
  }

  // ─── Queue Page ───
  if (showQueuePage) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8, textAlign: "center" }}>目前使用人數較多</h1>
        <p style={{ fontSize: 14, color: "#A8D0E6", textAlign: "center", lineHeight: 1.8, marginBottom: 24 }}>
          系統正在全力處理中，請稍候片刻。<br/>頁面會自動重新嘗試連線。
        </p>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, width: "100%", maxWidth: 320, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#A8D0E6", textAlign: "center", marginBottom: 8 }}>系統狀態</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#E9A825" }}>{firestoreErrors}</div>
              <div style={{ fontSize: 10, color: "#A8D0E6" }}>錯誤次數</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>30s</div>
              <div style={{ fontSize: 10, color: "#A8D0E6" }}>重試間隔</div>
            </div>
          </div>
        </div>
        <button onClick={() => { firestoreErrorRef.current = 0; setFirestoreErrors(0); setShowQueuePage(false); setReadOnlyMode(false); }} style={{ padding: "14px 32px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🔄 立即重試</button>
        <div style={{ marginTop: 16, fontSize: 12, color: "#88B5CF" }}>whatsfind-app.vercel.app</div>
      </div>
    );
  }

  if (showTutorial) {
    // Step -1: Video intro
    if (tutorialStep === -1) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <video
            ref={introVideoRef}
            src="/MindCast.mp4"
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            style={{ width: "100%", maxWidth: 480, maxHeight: "80vh", objectFit: "contain" }}
            onEnded={() => setTutorialStep(0)}
            onPlay={() => {
              // Unmute after play starts
              if (introVideoRef.current) introVideoRef.current.muted = false;
            }}
          />
          <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 12 }}>
            <button onClick={() => {
              if (introVideoRef.current) {
                introVideoRef.current.muted = false;
                introVideoRef.current.play().catch(() => {});
              }
            }} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}>🔊 開啟聲音</button>
            <button onClick={() => setTutorialStep(0)} style={{ padding: "10px 24px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>跳過影片 →</button>
          </div>
        </div>
      );
    }
    const page = tutorialPages[tutorialStep];
    const isLast = tutorialStep === tutorialPages.length - 1;
    return (
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px 24px", textAlign: "center", background: "linear-gradient(180deg, " + page.color + "08 0%, #F0F4F8 100%)", userSelect: "none", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, overflowY: "auto" }}>
        {/* Logo area */}
        <div style={{ marginBottom: 24, animation: "scaleIn 0.3s ease" }}>
          {tutorialStep === 0 ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}><img src="/icon-512.png" alt="" style={{ height: 120, width: 120, borderRadius: 24 }} /><div style={{ fontSize: 40, fontWeight: 900, color: "#1B4965", letterSpacing: -1.5, lineHeight: 1 }}>what<span style={{ position: "relative", display: "inline-block", width: 0 }}><span style={{ position: "absolute", bottom: "100%", marginBottom: 3, left: -3, width: 7, height: 11, background: "#4ADE80", borderRadius: 3 }}></span></span>sfind</div></div> : <div style={{ width: 120, height: 120, borderRadius: 30, background: "linear-gradient(135deg, " + page.color + "20, " + page.color + "10)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px " + page.color + "15", margin: "0 auto" }}><span style={{ fontSize: 56 }}>{page.icon}</span></div>}
        </div>
        <h2 style={{ color: "#1B4965", fontSize: 24, fontWeight: 800, margin: "0 0 12px", letterSpacing: -0.5, animation: "fadeIn 0.4s ease" }}>{page.title}</h2>
        <p style={{ color: "#5A7184", fontSize: 15, lineHeight: 1.8, margin: "0 0 24px", maxWidth: 340, animation: "fadeIn 0.5s ease" }}>{page.desc}</p>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32, maxWidth: 340, animation: "fadeIn 0.6s ease" }}>
          {page.features.map((f, i) => (
            <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: page.color + "12", color: page.color, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{f}</span>
          ))}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tutorialPages.map((_, i) => (
            <div key={i} onClick={() => setTutorialStep(i)} style={{ width: i === tutorialStep ? 28 : 8, height: 8, borderRadius: 4, background: i === tutorialStep ? page.color : "#DDE4EC", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 340 }}>
          {!isLast ? (
            <>
              <button onClick={closeTutorial} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "2px solid #E8EDF2", background: "#fff", color: "#8896A6", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{t.skip}</button>
              <button onClick={() => setTutorialStep(s => s + 1)} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, " + page.color + ", " + page.color + "CC)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px " + page.color + "30" }}>{t.next} →</button>
            </>
          ) : (
            <button onClick={closeTutorial} style={{ flex: 1, padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #E05A33, #D4880F)", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 24px rgba(224,90,51,0.35)", letterSpacing: 1 }}>{t.start}</button>
          )}
        </div>

        {/* Swipe hint on first page */}
        {tutorialStep === 0 && (
          <div style={{ marginTop: 20, fontSize: 12, color: "#B0BEC5", animation: "fadeIn 1s ease" }}>← 滑動或點擊圓點切換 →</div>
        )}
      </div>
    );
  }

  // ─── Loading ───
  if (authLoading || postsLoading) {
    return (
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={S.spinner} />
          <p style={{ color: "#5A7184", marginTop: 20 }}>{t.loading}</p>
        </div>
      </div>
    );
  }

  // ═══ CHAT VIEW ═══
  if (view === "chat" && chatTarget) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", background: "#F0F4F8", zIndex: 50, height: "100dvh" }}>
        <header style={{ ...S.header, flexShrink: 0 }}>
          <button onClick={() => { setView(selectedPost ? "detail" : "feed"); setChatTarget(null); setChatRoomId(null); setChatMessages([]); currentChatRoomRef.current = null; }} style={S.backBtn}>{ t.back }</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AvatarCircle name={chatTarget.name} avatar={chatTarget.avatar} size={28} />
            <span style={S.headerTitle}>{chatTarget.name}</span>
          </div>
          <span style={{ width: 48 }} />
        </header>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 16px 8px" }}>
          {(() => {
            const chatPost = posts.find(pp => activeChats.some(c => c.roomId === chatRoomId && c.postId === pp.id));
            if (!chatPost || !chatPost.reward || chatPost.reward <= 0 || chatPost.resolved) return null;
            return (
              <div style={{ padding: "12px 14px", background: "#FFF8E1", borderRadius: 12, marginBottom: 12, border: "1.5px solid #FFE082" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#E65100", marginBottom: 6 }}>💰 關於感謝金 NT${chatPost.reward.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#5A7184", lineHeight: 1.9 }}>
                  <div>✅ 建議<strong>面交時當場給付</strong>現金</div>
                  <div>🚫 請勿透過轉帳、匯款支付</div>
                  <div>🚫 平台不經手任何金錢往來</div>
                </div>
              </div>
            );
          })()}
          {chatMessages.length === 0 && <p style={{ textAlign: "center", color: "#8896A6", padding: 40 }}>{t.startChat}</p>}
          {chatMessages.map((m, i) => {
            const mine = m.from === user.uid;
            const hasLink = /https?:\/\/\S+|www\.\S+|bit\.ly|reurl\.cc|tinyurl/i.test(m.text);
            return (
              <div key={m.id || i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
                {!mine && <AvatarCircle name={chatTarget.name} avatar={chatTarget.avatar} size={24} />}
                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ ...S.chatBubble, background: mine ? "#1B4965" : "#fff", color: mine ? "#fff" : "#2C3E50", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{m.text || ""}</p>
                  </div>
                  {hasLink && !mine && <div style={{ fontSize: 10, color: "#E05A33", marginTop: 2 }}>⚠️ 此訊息含連結，請勿輕易點擊</div>}
                  {!mine && <button onClick={async () => {
                    if (!confirm("確定要檢舉這則訊息嗎？\n\n「" + m.text.slice(0, 50) + "」")) return;
                    await addDoc(collection(db, "reports"), {
                      type: "chat_message", reporterUid: user.uid, reporterName: user.name,
                      targetUid: m.from, targetName: m.fromName,
                      roomId: chatRoomId, messageText: m.text.slice(0, 200),
                      reason: "用戶檢舉聊天訊息", status: "pending", createdAt: serverTimestamp(),
                    });
                    for (const adminUid of ADMIN_UIDS) {
                      await addDoc(collection(db, "userNotifs"), {
                        targetUid: adminUid, type: "report", from: user.name,
                        postId: "", postTitle: "💬 聊天訊息檢舉：「" + m.text.slice(0, 30) + "」", read: false,
                        createdAt: serverTimestamp(),
                      });
                    }
                    alert("✅ 已檢舉，管理員會盡快處理");
                  }} style={{ background: "none", border: "none", fontSize: 10, color: "#B0BEC5", cursor: "pointer", marginTop: 2 }}>🚩 檢舉</button>}
                </div>
              </div>
            );
          })}
          {/* Handover status in chat */}
          {(() => {
            const chatPost = posts.find(pp => activeChats.some(c => c.roomId === chatRoomId && c.postId === pp.id));
            if (!chatPost) return null;
            if (chatPost.resolved) return (
              <div style={{ padding: "12px", background: "#E8F5E9", borderRadius: 12, margin: "8px 0", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2D8A5E" }}>✅ 已完成交接</div>
                <div style={{ fontSize: 11, color: "#5A7184", marginTop: 4 }}>此物品已成功尋回，感謝雙方的配合！</div>
              </div>
            );
            if (chatPost.handoverInitiated) return (
              <div style={{ padding: "12px", background: "#FFF3E0", borderRadius: 12, margin: "8px 0", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#E65100" }}>⏰ 等待對方確認交接</div>
                <div style={{ fontSize: 11, color: "#5A7184", marginTop: 4 }}>對方 48 小時內未確認將自動完成</div>
                <button onClick={() => { setSelectedPost(chatPost); setView("detail"); }} style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, border: "1.5px solid #2D8A5E", background: "#fff", color: "#2D8A5E", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📦 前往確認交接</button>
              </div>
            );
            return null;
          })()}
          <div ref={chatEndRef} />
        </div>
        <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "8px 16px", paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))", background: "#fff", borderTop: "1px solid #EEF2F7", marginTop: "auto" }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t.typeMsg} maxLength={500} style={{ ...S.chatInput, fontSize: 16, flex: 1, minWidth: 0, boxSizing: "border-box" }}
            onKeyDown={e => e.key === "Enter" && sendChat()} />
          <button onClick={sendChat} style={S.chatSendBtn}>{ t.send }</button>
        </div>
      </div>
    );
  }

  // ═══ PROFILE VIEW ═══
  if (view === "profile" && user) {
    return (
      <div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }}>
        <header style={S.header}>
          <button onClick={() => setView("feed")} style={S.backBtn}>{t.back}</button>
          <span style={S.headerTitle}>👤 個人頁面</span>
          <span style={{ width: 48 }} />
        </header>
        <div style={{ padding: 16 }}>
          {/* Profile card - horizontal: account left, score right */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 6px rgba(27,73,101,0.08)", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
              <AvatarCircle name={user.name} avatar={user.avatar} size={48} />
              <div>
                <h2 style={{ margin: 0, color: "#1B4965", fontSize: 17, fontWeight: 800 }}>{user.name}</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8896A6" }}>{user.email}</p>
                <div style={{ fontSize: 11, color: creditScore >= 80 ? "#2D8A5E" : creditScore >= 50 ? "#D4880F" : "#E05A33", fontWeight: 600, marginTop: 4 }}>
                  {creditScore >= 90 ? "🏆 信譽極佳" : creditScore >= 70 ? "✅ 信譽良好" : creditScore >= 50 ? "⚠️ 信譽普通" : "❌ 信譽不佳"}
                </div>
              </div>
            </div>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "conic-gradient(" + (creditScore >= 80 ? "#2D8A5E" : creditScore >= 50 ? "#D4880F" : "#E05A33") + " " + creditScore + "%, #EEF2F7 0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: creditScore >= 80 ? "#2D8A5E" : creditScore >= 50 ? "#D4880F" : "#E05A33", lineHeight: 1 }}>{Math.round(creditScore)}</span>
                <span style={{ fontSize: 9, color: "#5A7184" }}>信用分數</span>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 10 }}>📊 分數明細</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>基礎分數</span><span style={{ fontWeight: 600, color: "#1B4965" }}>100</span></div>
            {resolvedCount > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>✅ 成功尋回 ×{resolvedCount}</span><span style={{ fontWeight: 600, color: "#2D8A5E" }}>+{resolvedCount * 5}</span></div>}
            {highRatings > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>⭐ 好評(4-5星) ×{highRatings}</span><span style={{ fontWeight: 600, color: "#2D8A5E" }}>+{highRatings * 3}</span></div>}
            {lowRatings > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>👎 低評價 ×{lowRatings}</span><span style={{ fontWeight: 600, color: "#E05A33" }}>-{lowRatings * 5}</span></div>}
            {hiddenPosts > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>🚫 被隱藏貼文 ×{hiddenPosts}</span><span style={{ fontWeight: 600, color: "#E05A33" }}>-{hiddenPosts * 3}</span></div>}
            {isBlocked && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F7F9FC" }}><span style={{ color: "#5A7184" }}>🚫 帳號被封鎖</span><span style={{ fontWeight: 600, color: "#E05A33" }}>-50</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontWeight: 800 }}><span style={{ color: "#1B4965" }}>總分</span><span style={{ color: creditScore >= 80 ? "#2D8A5E" : creditScore >= 50 ? "#D4880F" : "#E05A33" }}>{Math.round(creditScore)}</span></div>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1B4965" }}>{myPosts.length}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>發文</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#2D8A5E" }}>{myPosts.filter(p => p.resolved).length}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>尋回</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#D4880F" }}>⭐ {avgRating}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>{userRatings.length} 次評價</div>
            </div>
          </div>
          {/* Rating details */}
          {userRatings.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1B4965", margin: "0 0 10px" }}>⭐ 收到的評價</h3>
              {userRatings.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < userRatings.length - 1 ? "1px solid #F0F4F8" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1B4965" }}>{r.raterName || "匿名用戶"}</div>
                    <div style={{ fontSize: 11, color: "#8896A6" }}>{r.createdAt?.toDate?.()?.toLocaleDateString("zh-TW") || ""}</div>
                  </div>
                  <div style={{ fontSize: 14 }}>{"⭐".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                </div>
              ))}
            </div>
          )}
          {/* Referral */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1B4965", margin: "0 0 10px" }}>🎁 推薦朋友</h3>
            <p style={{ fontSize: 12, color: "#5A7184", margin: "0 0 10px" }}>分享推薦連結，朋友透過連結加入即可獲得獎勵</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: "#F7F9FC", borderRadius: 10, padding: "10px 14px", fontSize: 16, fontWeight: 800, color: "#1B4965", letterSpacing: 2, textAlign: "center" }}>{referralCode}</div>
              <button onClick={() => {
                const url = "https://whatsfind-app.vercel.app/?ref=" + referralCode;
                const text = "推薦你使用 What'sfind 遺失物互助平台！\n\n📎 推薦碼：" + referralCode + "\n🔗 連結：" + url + "\n\n輸入推薦碼或點連結加入，雙方都有獎勵！";
                if (navigator.share) { navigator.share({ title: "What'sfind", text }).catch(() => {}); }
                else { navigator.clipboard.writeText(text).then(() => alert("推薦連結已複製！")); }
              }} style={{ ...S.sendBtn, fontSize: 13, padding: "10px 16px", whiteSpace: "nowrap" }}>📤 分享</button>
            </div>
            <div style={{ fontSize: 12, color: "#5A7184", marginBottom: 8 }}>已推薦 <span style={{ fontWeight: 800, color: "#1B4965", fontSize: 16 }}>{referralCount}</span> 人</div>
            {!isReferred && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input id="enterRefCode" placeholder="輸入推薦碼" style={{ ...S.input, flex: 1, fontSize: 13, padding: "8px 12px", textTransform: "uppercase" }} />
                <button onClick={async () => {
                  const code = document.getElementById("enterRefCode").value.trim().toUpperCase();
                  if (!code || code.length < 6) { alert("請輸入有效的推薦碼"); return; }
                  if (code === referralCode) { alert("不能使用自己的推薦碼"); return; }
                  try {
                    // Read all referral docs and match
                    const allRefs = await getDocs(collection(db, "referrals"));
                    let referrerUid = null;
                    allRefs.forEach(d => {
                      const docCode = d.id.substring(0, 8).toUpperCase();
                      const savedCode = (d.data().code || "").toUpperCase();
                      if (docCode === code || savedCode === code) referrerUid = d.id;
                    });
                    if (!referrerUid) { alert("找不到此推薦碼（" + code + "），請確認碼是否正確。\n\n提示：推薦人需要先登入過網站才會產生推薦碼。"); return; }
                    // Give referred user (self) +1 pin
                    await setDoc(doc(db, "referrals", user.uid), { code: referralCode, referredBy: referrerUid, count: increment(1) }, { merge: true });
                    // Give referrer +1 pin
                    try {
                      await updateDoc(doc(db, "referrals", referrerUid), { count: increment(1) });
                    } catch(e2) {
                      await setDoc(doc(db, "referrals", referrerUid), { count: 1 }, { merge: true });
                    }
                    setIsReferred(true);
                    alert("🎉 推薦碼已套用成功！");
                  } catch(e) {
                    console.error("Referral error:", e);
                    alert("套用失敗：" + e.code + " " + e.message);
                  }
                }} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>套用</button>
              </div>
            )}
            {isReferred && <div style={{ fontSize: 12, color: "#2D8A5E", marginBottom: 8 }}>✅ 已使用推薦碼加入</div>}
            {isReferred && isAdmin && <button onClick={async () => {
              try {
                await setDoc(doc(db, "referrals", user.uid), { code: referralCode, referredBy: null }, { merge: true });
                setIsReferred(false);
                alert("已重置推薦狀態（測試用）");
              } catch(e) { alert("重置失敗"); }
            }} style={{ ...S.miniBtn, background: "#8896A6", color: "#fff", fontSize: 11, marginBottom: 8 }}>🔄 重置推薦狀態（管理員測試）</button>}
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 12, fontSize: 12, color: "#5A7184", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 4 }}>獎勵說明：</div>
              <div>👤 推薦人：每推薦 1 人 → 獲得 1 次免費置頂</div>
              <div>🆕 被推薦人：首篇貼文自動置頂 1 天</div>
              <div style={{ marginTop: 6 }}>📌 可用置頂次數：<span style={{ fontWeight: 800, color: "#D4880F", fontSize: 16 }}>{referralCount}</span> 次</div>
            </div>
          </div>
          {/* Notification preferences */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, boxShadow: "0 1px 6px rgba(27,73,101,0.08)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1B4965", margin: "0 0 10px" }}>🔔 通知設定</h3>
            {[
              { key: "chat", label: "💬 聊天訊息", desc: "有人傳訊息給你" },
              { key: "claim", label: "🔑 認領申請", desc: "有人認領你的物品" },
              { key: "reply", label: "💬 留言回覆", desc: "有人在你的貼文留言" },
              { key: "system", label: "📢 系統通知", desc: "公告、提醒、更新" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F7F9FC" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1B4965" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#8896A6" }}>{item.desc}</div>
                </div>
                <button onClick={() => {
                  const updated = { ...notifPrefs, [item.key]: !notifPrefEnabled(item.key) };
                  setNotifPrefs(updated);
                  try { localStorage.setItem("lf_notif_prefs", JSON.stringify(updated)); } catch {}
                }} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: notifPrefEnabled(item.key) ? "#2D8A5E" : "#DDE4EC", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: notifPrefEnabled(item.key) ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            ))}
          </div>

          {/* Handover receipts */}
          {myPosts.filter(p => p.resolved).length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, boxShadow: "0 1px 6px rgba(27,73,101,0.08)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1B4965", margin: "0 0 8px" }}>📄 交接紀錄單</h3>
              <p style={{ fontSize: 11, color: "#8896A6", marginBottom: 8 }}>點擊直接產生紀錄單圖片</p>
              {myPosts.filter(p => p.resolved).map(p => (
                <div key={p.id} onClick={async () => {
                  try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 600;
                    let calcH = 90 + 32 * 4 + 40; // header + info rows
                    if (!p.selfFound) calcH += 32 + 20 + 20 + 100 + 20 + 40; // claimant + signatures
                    else calcH += 40;
                    calcH += 40; // footer
                    canvas.height = calcH;
                    const ctx = canvas.getContext("2d");
                    if (!ctx.roundRect) ctx.roundRect = function(x,y,w,h,r) { this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); };
                    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, canvas.height);
                    const hGrad = ctx.createLinearGradient(0, 0, 600, 0);
                    hGrad.addColorStop(0, "#1B4965"); hGrad.addColorStop(1, "#2D6E9E");
                    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, 600, 60);
                    ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
                    ctx.fillText(p.selfFound ? "✅ What'sfind 尋回紀錄" : "📦 What'sfind 交接紀錄單", 300, 40);
                    ctx.textAlign = "left"; ctx.font = "16px sans-serif"; ctx.fillStyle = "#2C3E50";
                    let ry = 90;
                    ctx.fillText("📋 物品：" + p.title, 30, ry); ry += 32;
                    ctx.fillText("👤 發文者：" + p.authorName, 30, ry); ry += 32;
                    if (p.selfFound) {
                      ctx.fillText("🙋 找回方式：自己找到", 30, ry); ry += 32;
                    } else {
                      // Load handover data for platform-found items
                      const hSnap = await getDocs(collection(db, "posts", p.id, "handover"));
                      const hDocs = hSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                      const ownerData = hDocs.find(d => d.id === p.authorUid) || null;
                      const claimantData = hDocs.find(d => d.id !== p.authorUid) || null;
                      const cSnap = await getDocs(query(collection(db, "posts", p.id, "claims"), where("status", "==", "approved")));
                      const claimantName = cSnap.docs[0]?.data()?.claimantName || "—";
                      ctx.fillText("🤝 拾獲者：" + claimantName, 30, ry); ry += 32;
                    }
                    ctx.fillText("📅 日期：" + (p.resolvedAt?.toDate?.()?.toLocaleDateString("zh-TW") || p.date || "—"), 30, ry); ry += 32;
                    ctx.fillText("📍 地點：" + (p.airport || p.locationText || "—"), 30, ry); ry += 40;
                    if (!p.selfFound) {
                      const hSnap2 = await getDocs(collection(db, "posts", p.id, "handover"));
                      const hDocs2 = hSnap2.docs.map(d => ({ id: d.id, ...d.data() }));
                      const ownerData = hDocs2.find(d => d.id === p.authorUid) || null;
                      const claimantData = hDocs2.find(d => d.id !== p.authorUid) || null;
                      ctx.strokeStyle = "#DDE4EC"; ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(570, ry); ctx.stroke(); ry += 20;
                      ctx.font = "bold 14px sans-serif"; ctx.fillStyle = "#1B4965";
                      ctx.fillText("✍️ 失主簽名", 30, ry); ctx.fillText("✍️ 拾獲者簽名", 310, ry); ry += 10;
                      const loadSig = (src) => new Promise((res) => { if (!src) { res(null); return; } const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = src; });
                      const sig1 = await loadSig(ownerData?.signature);
                      const sig2 = await loadSig(claimantData?.signature || claimantData?.otherSignature);
                      if (sig1) ctx.drawImage(sig1, 30, ry, 250, 80);
                      else { ctx.fillStyle = "#8896A6"; ctx.font = "13px sans-serif"; ctx.fillText("（線上確認，無簽名）", 30, ry + 40); }
                      if (sig2) ctx.drawImage(sig2, 310, ry, 250, 80);
                      else { ctx.fillStyle = "#8896A6"; ctx.font = "13px sans-serif"; ctx.fillText("（線上確認，無簽名）", 310, ry + 40); }
                      ry += 100;
                      ctx.strokeStyle = "#DDE4EC"; ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(570, ry); ctx.stroke(); ry += 20;
                      ctx.fillStyle = "#8896A6"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
                      ctx.fillText("收據編號：" + (ownerData?.receiptNo || claimantData?.receiptNo || "—"), 300, ry); ry += 20;
                    } else {
                      ctx.strokeStyle = "#DDE4EC"; ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(570, ry); ctx.stroke(); ry += 20;
                      ctx.fillStyle = "#8896A6"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
                    }
                    ctx.fillText("whatsfind-app.vercel.app", 300, canvas.height - 40);
                    ctx.fillStyle = "#1B4965"; ctx.font = "bold 13px sans-serif";
                    ctx.fillText("What'sfind — 免費的防冒領遺失物互助平台", 300, canvas.height - 20);
                    setReceiptImage(canvas.toDataURL("image/png"));
                  } catch(e) { alert("產生紀錄單失敗：" + e.message); }
                }} style={{ padding: "8px 10px", background: p.selfFound ? "#EBF5FB" : "#F0FFF4", borderRadius: 8, marginBottom: 4, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#1B4965", fontWeight: 600 }}>{p.selfFound ? "🙋" : "✅"} {p.title}</span>
                  <span style={{ fontSize: 11, color: p.selfFound ? "#1B4965" : "#2D8A5E" }}>📄 {p.selfFound ? "尋回紀錄" : "交接紀錄"}</span>
                </div>
              ))}
            </div>
          )}
          {/* My posts */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1B4965", margin: 0 }}>📝 我的貼文</h3>
              <span style={{ fontSize: 12, color: "#8896A6" }}>共 {myPosts.length} 篇</span>
            </div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[["all", "全部"], ["active", "尋找中"], ["resolved", "已尋回"]].map(([key, label]) => (
                <button key={key} onClick={() => setMyPostFilter(key)} style={{ padding: "5px 12px", borderRadius: 20, border: myPostFilter === key ? "2px solid #1B4965" : "1px solid #DDE4EC", background: myPostFilter === key ? "#1B496510" : "#F7F9FC", fontSize: 12, fontWeight: myPostFilter === key ? 700 : 400, color: myPostFilter === key ? "#1B4965" : "#8896A6", cursor: "pointer" }}>{label} ({key === "all" ? myPosts.length : key === "active" ? myPosts.filter(p => !p.resolved && !p.hidden).length : myPosts.filter(p => p.resolved).length})</button>
              ))}
            </div>
            {/* Post list - same style as home feed */}
            {myPosts
              .filter(p => myPostFilter === "all" ? true : myPostFilter === "active" ? (!p.resolved && !p.hidden) : p.resolved)
              .length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#8896A6" }}><div style={{ fontSize: 40 }}>📭</div><p>沒有符合的貼文</p></div>}
            {myPosts
              .filter(p => myPostFilter === "all" ? true : myPostFilter === "active" ? (!p.resolved && !p.hidden) : p.resolved)
              .map(p => {
              const cat = catInfo(p.category);
              return (
                <div key={p.id} onClick={() => { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }} style={{ ...S.postCard, opacity: p.resolved ? 0.75 : 1, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AvatarCircle name={user.name} avatar={user.avatar} size={24} />
                      <span style={{ ...S.catBadge, background: cat.color + "15", color: cat.color }}>{cat.img ? <img src={cat.img} alt="" style={{width:16,height:16,objectFit:"contain",verticalAlign:"middle",marginRight:2}} /> : cat.icon} {catLabel(cat)}</span>
                      {p.pinned && <span style={{ fontSize: 11, fontWeight: 700, color: "#D4880F", background: "#D4880F14", padding: "2px 8px", borderRadius: 6 }}>📌</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.hidden && <span style={{ fontSize: 11, fontWeight: 700, color: "#E05A33", background: "#E05A3314", padding: "2px 8px", borderRadius: 6 }}>🚫</span>}
                      {p.resolved && <span style={{ fontSize: 11, fontWeight: 700, color: "#2D8A5E", background: "#2D8A5E14", padding: "2px 8px", borderRadius: 6 }}>✅</span>}
                      <span style={{ fontSize: 12, color: "#8896A6" }}>{timeAgo(p.date, t)}</span>
                    </div>
                  </div>
                  <h3 style={{ ...S.postTitle, textDecoration: p.resolved ? "line-through" : "none", color: p.resolved ? "#8896A6" : "#1A2B3C" }}>{p.title}</h3>
                  <p style={S.postDesc}>{(p.desc || "").replace(/\n航班：.+/, "").slice(0, 70)}⋯</p>
                  {p.photos?.length > 0 && !isPhotoExpired(p.photosUploadedAt) && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {p.photos.slice(0, 3).map((src, i) => <img key={i} src={src} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />)}
                    </div>
                  )}
                  <div style={S.postFooter}>
                    <span style={{ fontSize: 12, color: "#5A7184" }}>📍 {p.locationText || p.airport}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {p.reward > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#2D8A5E", background: "#2D8A5E14", padding: "1px 8px", borderRadius: 6 }}>💰 NT${p.reward.toLocaleString()}</span>}
                      {p.verifyQuestions?.length > 0 && <span style={{ fontSize: 11 }}>🛡️</span>}
                      {pendingCount(p) > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#E05A33", background: "#E05A3314", padding: "1px 8px", borderRadius: 6 }}>{pendingCount(p)} 待審</span>}
                      <span style={{ fontSize: 12, color: "#8896A6" }}>💬</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Receipt Preview Modal */}
        {receiptImage && (
          <div style={S.modalOverlay} onClick={() => setReceiptImage(null)}>
            <div style={{ ...S.modalCard, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>📄 交接紀錄單</h3>
                <button onClick={() => setReceiptImage(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
              </div>
              <img src={receiptImage} alt="交接紀錄單" style={{ width: "100%", borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
              <button onClick={async () => {
                try {
                  const res = await fetch(receiptImage);
                  const blob = await res.blob();
                  const file = new File([blob], "whatsfind-receipt.png", { type: "image/png" });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: "What'sfind 交接紀錄單" });
                    alert("✅ 已分享！");
                  } else {
                    setLightbox({ photos: [receiptImage], index: 0 });
                    setReceiptImage(null);
                    alert("📱 長按圖片即可儲存到相簿");
                  }
                } catch(e) {
                  if (e.name !== "AbortError") { setLightbox({ photos: [receiptImage], index: 0 }); setReceiptImage(null); alert("📱 長按圖片即可儲存到相簿"); }
                }
              }} style={{ ...S.modalPrimaryBtn, marginBottom: 0 }}>💾 儲存紀錄單</button>
              <button onClick={() => setReceiptImage(null)} style={{ ...S.modalSecondaryBtn, marginTop: 8 }}>關閉</button>
            </div>
          </div>
        )}
        {bottomNavBar}
      </div>
    );
  }

  // ═══ LOGIN VIEW ═══
  if (view === "login") {
    return (
      <div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }}>
        {tutorialVideoModal}
        {postPopupModal}
        <header style={S.header}><button onClick={() => setView("feed")} style={S.backBtn}>{ t.back }</button><span style={S.headerTitle}>{ t.login }</span><span style={{ width: 48 }} /></header>
        <div style={{ padding: "24px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#1B4965", letterSpacing: -1.5, lineHeight: 1, marginBottom: 12 }}>what<span style={{ position: "relative", display: "inline-block", width: 0 }}><span style={{ position: "absolute", bottom: "100%", marginBottom: 2, left: -2, width: 6, height: 10, background: "#4ADE80", borderRadius: 2 }}></span></span>sfind</div>
            <h2 style={{ color: "#1B4965", margin: "0 0 6px", fontSize: 22 }}>{t.welcomeTitle}</h2>
            <p style={{ color: "#5A7184", fontSize: 14, margin: 0 }}>{t.welcomeDesc}</p>
          </div>

          {/* Tutorial animation */}
          <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1.5px solid #EEF2F7", background: "#F0F4F8" }}>
            <div onClick={() => setShowTutorialVideo(true)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>📖</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1B4965" }}>使用教學</div>
                  <div style={{ fontSize: 11, color: "#8896A6" }}>40 秒了解 What'sfind 怎麼用</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "#2D8A5E", fontWeight: 700 }}>▶️ 播放</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #EEF2F7", marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#F7F9FC", fontWeight: 700, fontSize: 14, color: "#1B4965" }}>📄 服務條款</div>
            <div style={{ padding: "12px 16px", maxHeight: 150, overflowY: "auto", fontSize: 12, color: "#5A7184", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{t.termsContent}</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #EEF2F7", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#F7F9FC", fontWeight: 700, fontSize: 14, color: "#1B4965" }}>🔐 隱私權政策</div>
            <div style={{ padding: "12px 16px", maxHeight: 150, overflowY: "auto", fontSize: 12, color: "#5A7184", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{t.privacyContent}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "14px 16px", background: "#F7F9FC", borderRadius: 12 }}>
            <input type="checkbox" id="agreeTerms" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} style={{ width: 22, height: 22, flexShrink: 0, accentColor: "#1B4965" }} />
            <label htmlFor="agreeTerms" style={{ fontSize: 14, color: "#1B4965", fontWeight: 700, cursor: "pointer" }}>我已閱讀並同意以上條款</label>
          </div>
          <button onClick={() => { if (!agreedTerms) { alert("請先閱讀並勾選同意服務條款與隱私權政策"); return; } handleGoogleLogin(); }} style={{ ...S.googleBtn, opacity: agreedTerms ? 1 : 0.5 }}><GoogleIcon /><span>{t.googleLogin}</span></button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="/verify.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8896A6", textDecoration: "none" }}>🛡️ 如何確認您在官方網站？點此驗證</a>
          </div>
        </div>
      </div>
    );
  }

  // ═══ DETAIL VIEW ═══
  if (selectedPost && view !== "chat" && view !== "post") {
    const p = selectedPost;
    const cat = catInfo(p.category);
    const owner = isOwner(p);
    const canSeeContact = contactVisible(p);
    return (
      <div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }}>
        <header style={S.header}>
          <button onClick={() => { setSelectedPost(null); setShowClaimModal(false); setShowResolveModal(false); setView("feed"); }} style={S.backBtn}>{ t.back }</button>
          <span style={S.headerTitle}>{ t.detail }</span><span style={{ width: 48 }} />
        </header>
        <div style={{ ...S.detailCard, maxWidth: desktopWide ? "100%" : 720 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span onClick={() => viewAuthorProfile(p.authorUid, p.authorName, p.authorAvatar)} style={{ cursor: "pointer" }}><AvatarCircle name={p.authorName} avatar={p.authorAvatar} size={32} /></span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1B4965" }}>{p.authorName} {p.proBadge ? "🏅" : ""}</span>
              {authorCredit && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
                  background: authorCredit.score >= 80 ? "#2D8A5E14" : authorCredit.score >= 50 ? "#D4880F14" : "#E05A3314",
                  color: authorCredit.score >= 80 ? "#2D8A5E" : authorCredit.score >= 50 ? "#D4880F" : "#E05A33"
                }}>{authorCredit.score >= 80 ? "🏆" : authorCredit.score >= 50 ? "⚠️" : "❌"} {authorCredit.score}分</span>
              )}
            </div>
            {p.resolved && <span style={S.resolvedBadge}>✅ 已尋回</span>}
            {p.resolved && p.resolvedAt && (() => {
              const rd = p.resolvedAt?.toDate?.() || (p.resolvedAt?.seconds ? new Date(p.resolvedAt.seconds * 1000) : null);
              if (!rd) return null;
              const daysLeft = Math.max(0, 30 - Math.floor((new Date() - rd) / 86400000));
              return <span style={{ fontSize: 11, color: "#8896A6", marginLeft: 6 }}>（{daysLeft}天後自動移除）</span>;
            })()}
          </div>

          {/* Low credit warning */}
          {authorCredit && authorCredit.score < 50 && (
            <div style={{ padding: "10px 14px", background: "#FFF0F0", borderRadius: 12, border: "1.5px solid #FFCDD2", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E05A33" }}>此用戶信用分數偏低（{authorCredit.score}分）</div>
                <div style={{ fontSize: 12, color: "#8B6914" }}>請謹慎交易，建議透過平台聊天溝通，避免私下轉帳。</div>
              </div>
            </div>
          )}
          {authorCredit && authorCredit.score >= 50 && authorCredit.score < 70 && (
            <div style={{ padding: "10px 14px", background: "#FFF8E1", borderRadius: 12, border: "1.5px solid #FFE082", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#D4880F" }}>此用戶信用分數普通（{authorCredit.score}分）</div>
                <div style={{ fontSize: 12, color: "#8B6914" }}>建議確認對方身份後再進行交接。</div>
              </div>
            </div>
          )}
          <span style={{ ...S.catBadge, background: cat.color + "18", color: cat.color }}>{cat.img ? <img src={cat.img} alt="" style={{width:16,height:16,objectFit:"contain",verticalAlign:"middle",marginRight:2}} /> : cat.icon} {catLabel(cat)}</span>
          <h2 style={S.detailTitle}>{p.title} {p.editedAt && <span style={{ fontSize: 11, fontWeight: 600, color: "#8896A6", verticalAlign: "middle" }}>（已編輯）</span>}</h2>
          <div style={S.detailMeta}><span>📍 {p.locationText || p.airport}</span><span>📅 {p.date}</span></div>

          {/* Reward */}
          {p.reward > 0 && (
            <div style={{ marginBottom: 12, padding: "12px 16px", background: "linear-gradient(135deg, #F0FFF4, #E8F5E9)", borderRadius: 12, border: "1px solid #A5D6A7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2D8A5E" }}>💰 {t.rewardLabel}</div>
                <div style={{ fontSize: 11, color: "#5A7184" }}>尋獲歸還者可獲得此獎勵</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#2D8A5E" }}>NT$ {p.reward.toLocaleString()}</div>
            </div>
          )}

          {/* Share & Map buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => sharePost(p)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #DDE4EC", background: "#fff", fontSize: 13, cursor: "pointer", color: "#1B4965", fontWeight: 600 }}>📤 分享</button>
            {getAirportCoords(p.airport) && <button onClick={() => setShowMap(!showMap)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #DDE4EC", background: "#fff", fontSize: 13, cursor: "pointer", color: "#1B4965", fontWeight: 600 }}>🗺️ {showMap ? "隱藏地圖" : "顯示地圖"}</button>}
          </div>
          {showMap && getAirportCoords(p.airport) && (
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, height: 200 }}>
              <iframe title="map" width="100%" height="200" frameBorder="0" style={{ border: 0 }}
                src={"https://maps.google.com/maps?q=" + getAirportCoords(p.airport).lat + "," + getAirportCoords(p.airport).lng + "&z=14&output=embed"} />
            </div>
          )}
          <p style={S.detailDesc}>{(() => {
            const flightMatch = (p.desc || "").match(/\n航班：(.+)/);
            const descWithoutFlight = (p.desc || "").replace(/\n航班：.+/, "");
            return <>
              {flightMatch && <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>✈️ 航班：{flightMatch[1]}</span>}
              {descWithoutFlight}
            </>;
          })()}</p>
          {translatedText && <div style={{ background: "#F0F4F8", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13, color: "#2C3E50", lineHeight: 1.6, whiteSpace: "pre-wrap" }}><div style={{ fontSize: 11, color: "#8896A6", marginBottom: 4 }}>🌐 翻譯結果：</div>{translatedText}</div>}
          <button onClick={async () => {
            if (translatedText) { setTranslatedText(""); return; }
            const targetLang = lang === "zh" ? "zh-TW" : lang === "ko" ? "ko" : lang === "ja" ? "ja" : "en";
            try {
              setTranslatedText("翻譯中...");
              const flightLine = (p.desc || "").match(/航班：(.+)/);
              const cleanDesc = (p.desc || "").replace(/\n航班：.+/, "");
              const translateSource = p.title + (flightLine ? "\n航班：" + flightLine[1] : "") + "\n\n" + cleanDesc;
              const encoded = encodeURIComponent(translateSource.substring(0, 1000));
              // Try primary API
              let data;
              try {
                const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&q=" + encoded);
                if (!res.ok) throw new Error("Primary API failed");
                data = await res.json();
              } catch(e1) {
                // Try fallback API
                const res2 = await fetch("https://translate.google.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=" + targetLang + "&dt=t&q=" + encoded);
                if (!res2.ok) throw new Error("Both APIs failed");
                data = await res2.json();
              }
              const text = data && data[0] ? data[0].filter(s => s && s[0]).map(s => s[0]).join("") : "";
              if (!text) throw new Error("Empty result");
              setTranslatedText(text);
            } catch(e) {
              console.error("Translation error:", e);
              setTranslatedText("翻譯失敗，請稍後再試");
            }
          }} style={{ background: "none", border: "1px solid #DDE4EC", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: translatedText ? "#E05A33" : "#5A7184", cursor: "pointer", marginBottom: 8 }}>{translatedText ? "✕ 關閉翻譯" : "🌐 翻譯此貼文"}</button>
          {/* Time */}
          {p.time && <div style={{ fontSize: 13, color: "#5A7184", marginBottom: 8 }}>⏰ {p.time}</div>}
          {p.wrongType && <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, background: p.wrongType === "took" ? "#D4880F14" : "#E05A3314", color: p.wrongType === "took" ? "#D4880F" : "#E05A33", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{p.wrongType === "took" ? "🙋 我拿錯別人的" : "😰 我的被拿走了"}</div>}
          {p.postType && <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, background: p.postType === "found" ? "#2D8A5E14" : "#1B496514", color: p.postType === "found" ? "#2D8A5E" : "#1B4965", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{p.postType === "found" ? "🔍 我撿到了" : "😰 我遺失了"}</div>}
          {/* Photos */}
          {p.photos?.length > 0 && !isPhotoExpired(p.photosUploadedAt) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {p.photos.map((src, i) => (
                <div key={i} onClick={() => setLightbox({ photos: p.photos, index: i })} style={{ position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} onContextMenu={e => e.preventDefault()} />
                </div>
              ))}
            </div>
          )}
          {p.photos?.length > 0 && isPhotoExpired(p.photosUploadedAt) && (
            <div style={{ fontSize: 12, color: "#8896A6", marginBottom: 8, fontStyle: "italic" }}>📷 照片已過期（上傳超過15天）</div>
          )}

          {/* Pinned location */}
          {p.locationText && <div style={{ fontSize: 14, color: "#1B4965", fontWeight: 600, marginBottom: 8 }}>📍 撿到地點：{p.locationText}</div>}
          {p.location && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#1B4965", fontWeight: 600, marginBottom: 6 }}>📍 遺失地點</div>
              <div style={{ borderRadius: 14, overflow: "hidden", height: 180 }}>
                <iframe title="loc" width="100%" height="180" frameBorder="0" style={{ border: 0 }}
                  src={"https://maps.google.com/maps?q=" + p.location.lat + "," + p.location.lng + "&z=16&output=embed"} />
              </div>
            </div>
          )}

          <div style={{ ...S.contactBox, background: canSeeContact ? "#EBF5FB" : "#FFF5F0", borderLeft: canSeeContact ? "4px solid #1B4965" : "4px solid #D4880F" }}>
            {canSeeContact ? (<><span style={{ fontWeight: 600, color: "#1B4965" }}>📞 聯絡方式</span><span>{getContactInfo(p)}</span></>) : (<><span style={{ fontWeight: 600, color: "#D4880F" }}>🔒 聯絡方式已隱藏</span><span style={{ fontSize: 13, color: "#5A7184" }}>請先通過驗證才能查看聯絡資訊。</span></>)}
          </div>

          {p.verifyQuestions?.length > 0 && (
            <div style={S.shieldBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <span style={{ fontWeight: 700, color: "#1B4965", fontSize: 14 }}>防冒領驗證保護中（{p.verifyQuestions.length} 道驗證題）</span>
              </div>
            </div>
          )}

          {!p.resolved && !owner && user && !hasPendingClaim(p) && !hasApprovedClaim(p) && (
            <button onClick={() => { setClaimAnswers((p.verifyQuestions || []).map(() => "")); setClaimMessage(""); setClaimSubmitted(false); setShowClaimModal(true); }} style={S.claimBtn}>🔑 我是失主，提交認領申請</button>
          )}
          {!user && !p.resolved && <button onClick={() => setView("login")} style={S.claimBtn}>🔑 登入後認領</button>}
          {hasPendingClaim(p) && <div style={S.pendingNotice}>⏳ 您的認領申請審核中</div>}
          {hasApprovedClaim(p) && (<>
            <div style={{ ...S.pendingNotice, background: "#F0FFF4", borderColor: "#2D8A5E", color: "#2D8A5E" }}>✅ 驗證通過！</div>
            <button onClick={() => openChat(p.authorUid, p.authorName, null, p.authorAvatar)} style={{ ...S.claimBtn, background: "linear-gradient(135deg, #1B4965, #2D6E9E)" }}>💬 與發文者聊天</button>
          </>)}

          {/* Owner: view claims */}
          {owner && postClaims.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", marginBottom: 10 }}>📋 認領申請 ({postClaims.length})</h3>
              {postClaims.map((c) => (
                <div key={c.id} style={{ ...S.claimCard, borderLeft: "4px solid " + (c.status === "approved" ? "#2D8A5E" : c.status === "rejected" ? "#E05A33" : "#D4880F") }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AvatarCircle name={c.claimantName} size={24} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#1B4965" }}>{c.claimantName}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: c.status === "approved" ? "#2D8A5E18" : c.status === "rejected" ? "#E05A3318" : "#D4880F18", color: c.status === "approved" ? "#2D8A5E" : c.status === "rejected" ? "#E05A33" : "#D4880F" }}>
                      {c.status === "approved" ? "✅ 已通過" : c.status === "rejected" ? "❌ 已拒絕" : "⏳ 待審核"}
                    </span>
                  </div>
                  {(p.verifyQuestions || []).map((vq, qi) => (
                    <div key={qi} style={{ fontSize: 12, marginBottom: 4, padding: "4px 8px", background: "#F7F9FC", borderRadius: 6 }}>
                      <span style={{ color: "#1B4965", fontWeight: 600 }}>Q：{vq.q}</span><br />
                      <span style={{ color: "#8896A6" }}>回答：</span><span style={{ color: "#E05A33" }}>{c.answers?.[qi] || "—"}</span>
                    </div>
                  ))}
                  {c.status === "pending" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleClaimAction(c.id, "approved")} style={{ ...S.miniBtn, background: "#2D8A5E", color: "#fff" }}>✅ 通過</button>
                      <button onClick={() => handleClaimAction(c.id, "rejected")} style={{ ...S.miniBtn, background: "#E05A33", color: "#fff" }}>❌ 拒絕</button>
                    </div>
                  )}
                  {c.status === "approved" && (
                    <button onClick={() => openChat(c.claimantUid, c.claimantName, null, c.claimantAvatar)} style={{ ...S.miniBtn, background: "#1B4965", color: "#fff", marginTop: 8 }}>💬 聊天</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!p.resolved && owner && <button onClick={() => { setResolveStep("confirm"); setShowResolveModal(true); }} style={S.resolveBtn}>🎉 我已找回物品</button>}
          {canEdit(p) && (
            <button onClick={() => startEdit(p)} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 14, background: "none", border: "2px solid #1B4965", color: "#1B4965", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              ✏️ 編輯（{Math.max(0, Math.ceil(10 - (new Date() - (p.createdAt?.toDate?.() || new Date())) / 60000))} 分鐘內可編輯）
            </button>
          )}
          {!p.resolved && owner && !p.pinned && referralCount > 0 && (
            <button onClick={async () => {
              try {
                await updateDoc(doc(db, "posts", p.id), { pinned: true });
                const rDoc = await getDoc(doc(db, "referrals", user.uid));
                await setDoc(doc(db, "referrals", user.uid), { count: Math.max(0, (rDoc.data()?.count || 0) - 1) }, { merge: true });
                alert("📌 已置頂！");
              } catch(e) { alert("置頂失敗"); }
            }} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, background: "linear-gradient(135deg, #D4880F, #E9A825)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📌 使用免費置頂（剩餘 {referralCount} 次）</button>
          )}
          {owner && (!p.resolved || isAdmin) && !p.hidden && <button onClick={async () => { if (confirm("確定要刪除這篇貼文嗎？刪除後無法復原。")) { try { await saveClaimedReward(p.id); await deleteDoc(doc(db, "posts", p.id)); setSelectedPost(null); setView("feed"); } catch(e) { alert("刪除失敗"); } } }} style={S.deleteBtn}>{t.deleteBtn}</button>}
          {user && !owner && !p.hidden && !p.resolved && (
            <button onClick={async () => {
              if (!confirm(t.reportFoundConfirm)) return;
              await addDoc(collection(db, "reports"), {
                type: "report_found", postId: p.id, postTitle: p.title,
                reporterUid: user.uid, reporterName: user.name,
                targetUid: p.authorUid, reason: "其他用戶回報疑似已找到",
                createdAt: serverTimestamp(),
              });
              // Notify post owner
              await addDoc(collection(db, "userNotifs"), {
                targetUid: p.authorUid, type: "report_found",
                postId: p.id, postTitle: p.title,
                from: user.name, createdAt: serverTimestamp(),
              });
              // Notify admin
              for (const adminUid of ADMIN_UIDS) {
                await addDoc(collection(db, "userNotifs"), {
                  targetUid: adminUid, type: "report", from: user.name,
                  postId: p.id, postTitle: "✅ 用戶回報：「" + p.title + "」疑似已尋回", read: false,
                  createdAt: serverTimestamp(),
                });
              }
              alert(t.reportFoundDone);
            }} style={{ ...S.reportBtn, color: "#D4880F", borderColor: "#D4880F30" }}>{t.reportFound}</button>
          )}
          {user && !owner && !p.hidden && <button onClick={() => reportPost(p.id)} style={S.reportBtn}>{t.reportBtn}</button>}
          {isAdmin && !p.hidden && <button onClick={() => adminTogglePin(p.id, p.pinned)} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, background: "none", border: "2px solid #D4880F", color: "#D4880F", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{p.pinned ? "📌 取消置頂" : "📌 置頂貼文"}</button>}
          {owner && !p.resolved && !p.hidden && !isAdmin && (
            <button onClick={() => userPinPost(p.id)} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, background: p.pinned ? "#D4880F" : "none", border: "2px solid #D4880F", color: p.pinned ? "#fff" : "#D4880F", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {p.pinned ? "📌 已置頂（點擊取消）" : "📌 置頂貼文（免費 3 天）"}
            </button>
          )}
          {isAdmin && !owner && !p.hidden && <button onClick={() => adminDeletePost(p.id)} style={S.deleteBtn}>{t.adminDelete}</button>}
          {isAdmin && !owner && <button onClick={() => blockUser(p.authorUid, p.authorName)} style={{ ...S.reportBtn, marginTop: 4, color: "#E05A33", borderColor: "#E05A33" }}>🚫 封鎖此用戶</button>}
          {isAdmin && p.hidden && <div style={S.hiddenNotice}>🚫 此留言已被管理員隱藏</div>}
          {isAdmin && p.hidden && <button onClick={() => adminRestorePost(p.id)} style={{ ...S.resolveBtn, marginTop: 8 }}>↩️ 恢復此留言</button>}
          {isAdmin && p.hidden && <button onClick={async () => { if (confirm("永久刪除？此操作無法復原。")) { try { await saveClaimedReward(p.id); await deleteDoc(doc(db, "posts", p.id)); for (const r of reportsList.filter(rr => rr.postId === p.id)) { try { await deleteDoc(doc(db, "reports", r.id)); } catch {} } setReportsList(prev => prev.filter(r => r.postId !== p.id)); setSelectedPost(null); setView("feed"); } catch(e) { alert("刪除失敗"); } } }} style={{ ...S.deleteBtn, marginTop: 8 }}>🗑️ 永久刪除</button>}

          {/* Handover confirmation */}
          {p.resolved && postClaims.some(c => c.status === "approved") && (owner || hasApprovedClaim(p)) && (
            <div style={{ marginTop: 16, padding: 14, background: "#F0FFF4", borderRadius: 12, border: "1px solid #C8E6C9" }}>
              {handoverStatus.owner && handoverStatus.claimant ? (
                <>
                <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #C8E6C9" }}>
                  <div style={{ textAlign: "center", color: "#2D8A5E", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>✅ 交接完成</div>
                  <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 1.8 }}>
                    <div>📋 物品：{p.title}</div>
                    <div>👤 失主：{p.authorName}</div>
                    <div>🤝 拾獲者：{postClaims.find(c => c.status === "approved")?.claimantName || "—"}</div>
                    <div>📅 時間：{new Date().toLocaleDateString("zh-TW")}</div>
                  </div>
                </div>
                <button onClick={async () => {
                  try {
                    // Generate receipt image with signatures
                    const canvas = document.createElement("canvas");
                    canvas.width = 600;
                    // Calculate height dynamically
                    let calcH = 90; // header
                    calcH += 32 * 4 + 40; // info rows + spacing
                    if (handoverStatus.owner || handoverStatus.claimant) calcH += 20 + 20 + 100 + 20 + 40; // signatures
                    else calcH += 40;
                    calcH += 40; // footer
                    canvas.height = calcH;
                    const ctx = canvas.getContext("2d");
                    // Background
                    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, 700);
                    // Header bar
                    const hGrad = ctx.createLinearGradient(0, 0, 600, 0);
                    hGrad.addColorStop(0, "#1B4965"); hGrad.addColorStop(1, "#2D6E9E");
                    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, 600, 60);
                    ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
                    ctx.fillText("📦 What'sfind 交接紀錄單", 300, 40);
                    // Info
                    ctx.textAlign = "left"; ctx.font = "16px sans-serif"; ctx.fillStyle = "#2C3E50";
                    let ry = 90;
                    ctx.fillText("📋 物品：" + p.title, 30, ry); ry += 32;
                    ctx.fillText("👤 失主：" + p.authorName, 30, ry); ry += 32;
                    ctx.fillText("🤝 拾獲者：" + (postClaims.find(c => c.status === "approved")?.claimantName || "—"), 30, ry); ry += 32;
                    ctx.fillText("📅 日期：" + new Date().toLocaleDateString("zh-TW"), 30, ry); ry += 32;
                    ctx.fillText("📍 地點：" + (p.airport || p.locationText || "—"), 30, ry); ry += 40;
                    // Divider
                    ctx.strokeStyle = "#DDE4EC"; ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(570, ry); ctx.stroke(); ry += 20;
                    // Signatures
                    ctx.font = "bold 14px sans-serif"; ctx.fillStyle = "#1B4965";
                    ctx.fillText("✍️ 失主簽名", 30, ry); ctx.fillText("✍️ 拾獲者簽名", 310, ry); ry += 10;
                    // Load signatures from handover docs
                    const ownerDoc = handoverStatus.ownerData;
                    const claimantDoc = handoverStatus.claimantData;
                    const loadSig = (src) => new Promise((res) => {
                      if (!src) { res(null); return; }
                      const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = src;
                    });
                    const sig1 = await loadSig(ownerDoc?.signature);
                    const sig2 = await loadSig(claimantDoc?.signature || claimantDoc?.otherSignature);
                    if (sig1) ctx.drawImage(sig1, 30, ry, 250, 80);
                    else { ctx.fillStyle = "#8896A6"; ctx.font = "13px sans-serif"; ctx.fillText("（線上確認，無簽名）", 30, ry + 40); }
                    if (sig2) ctx.drawImage(sig2, 310, ry, 250, 80);
                    else { ctx.fillStyle = "#8896A6"; ctx.font = "13px sans-serif"; ctx.fillText("（線上確認，無簽名）", 310, ry + 40); }
                    ry += 100;
                    // Receipt number
                    ctx.strokeStyle = "#DDE4EC"; ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(570, ry); ctx.stroke(); ry += 20;
                    ctx.fillStyle = "#8896A6"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
                    ctx.fillText("收據編號：" + (ownerDoc?.receiptNo || claimantDoc?.receiptNo || "—"), 300, ry); ry += 20;
                    ctx.fillText("whatsfind-app.vercel.app", 300, ry);
                    // Footer
                    ctx.fillStyle = "#1B4965"; ctx.font = "bold 13px sans-serif";
                    ctx.fillText("What'sfind — 防冒領遺失物 · 走失寵物協尋平台", 300, 680);
                    // Show in preview modal
                    const dataUrl = canvas.toDataURL("image/png");
                    setReceiptImage(dataUrl);
                  } catch(e) { console.error(e); alert("產生紀錄單失敗"); }
                }} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📄 下載交接紀錄單（含簽名）</button>
                <button onClick={() => shareSuccess(p.title)} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #E05A33, #D4880F)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📤 分享成功故事，推薦給朋友</button>
                {userRatings.some(r => r.postId === p.id) ? (
                  <div style={{ textAlign: "center", marginTop: 8, padding: "10px", background: "#F0FFF4", borderRadius: 10, fontSize: 13, color: "#2D8A5E", fontWeight: 600 }}>✅ 已完成評價</div>
                ) : (
                  <button onClick={() => {
                    const approved = postClaims.find(c => c.status === "approved");
                    if (owner && approved) setRatingTarget({ uid: approved.claimantUid, name: approved.claimantName });
                    else if (!owner) setRatingTarget({ uid: p.authorUid, name: p.authorName });
                    else { alert("找不到評價對象"); return; }
                    setRatingStars(0); setShowRating(true);
                  }} style={{ ...S.claimBtn, marginTop: 8, background: "linear-gradient(135deg, #D4880F, #E9A825)", padding: "10px", fontSize: 13 }}>⭐ {t.rateTitle}</button>
                )}
                </>
              ) : (
                <>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1B4965", marginBottom: 8 }}>📦 交接紀錄單</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: handoverStatus.owner ? "#2D8A5E18" : "#EEF2F7", color: handoverStatus.owner ? "#2D8A5E" : "#8896A6", fontWeight: 600 }}>{handoverStatus.owner ? "✅" : "⏳"} {t.ownerConfirmed}</span>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: handoverStatus.claimant ? "#2D8A5E18" : "#EEF2F7", color: handoverStatus.claimant ? "#2D8A5E" : "#8896A6", fontWeight: 600 }}>{handoverStatus.claimant ? "✅" : "⏳"} {t.finderConfirmed}</span>
                </div>
                {((owner && !handoverStatus.owner) || (!owner && hasApprovedClaim(p) && !handoverStatus.claimant)) && !showHandoverForm && (
                  <button onClick={() => confirmHandover(p.id)} style={{ ...S.resolveBtn, marginTop: 4, padding: "10px", fontSize: 13 }}>{t.handoverConfirm}</button>
                )}
                {showHandoverForm && (
                  <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginTop: 8, border: "1px solid #E8EDF2" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📝 填寫交接資料</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <button type="button" onClick={() => setHandoverFaceToFace(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: !handoverFaceToFace ? "2px solid #1B4965" : "1.5px solid #DDE4EC", background: !handoverFaceToFace ? "#1B496510" : "#fff", fontSize: 12, fontWeight: !handoverFaceToFace ? 700 : 500, color: !handoverFaceToFace ? "#1B4965" : "#5A7184", cursor: "pointer" }}>📦 寄送/遠端</button>
                      <button type="button" onClick={() => setHandoverFaceToFace(true)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: handoverFaceToFace ? "2px solid #2D8A5E" : "1.5px solid #DDE4EC", background: handoverFaceToFace ? "#2D8A5E10" : "#fff", fontSize: 12, fontWeight: handoverFaceToFace ? 700 : 500, color: handoverFaceToFace ? "#2D8A5E" : "#5A7184", cursor: "pointer" }}>🤝 面對面</button>
                    </div>
                    <textarea value={handoverNote} onChange={e => setHandoverNote(e.target.value)} placeholder="交接備註（如：面交地點、物品狀態描述⋯）" style={{ ...S.textarea, minHeight: 60, fontSize: 13, marginBottom: 8 }} />
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#5A7184", marginBottom: 4 }}>📷 拍攝交接照片（選填）</div>
                      {handoverPhoto ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={handoverPhoto} alt="" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} />
                          <button onClick={() => setHandoverPhoto(null)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#E05A33", color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>✕</button>
                        </div>
                      ) : (
                        <label style={{ display: "inline-block", padding: "8px 16px", borderRadius: 8, border: "1.5px dashed #DDE4EC", cursor: "pointer", fontSize: 12, color: "#5A7184" }}>📷 上傳照片<input type="file" accept="image/*" hidden onChange={handleHandoverPhoto} /></label>
                      )}
                    </div>
                    {handoverFaceToFace && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1B4965", marginBottom: 4 }}>✍️ 我的簽名</div>
                        <canvas id="signatureCanvas" width="280" height="70" style={{ border: "1.5px solid #DDE4EC", borderRadius: 8, background: "#fff", touchAction: "none", width: "100%", height: 70, cursor: "crosshair" }}
                          onPointerDown={e => { const c = e.target, ctx = c.getContext("2d"), r = c.getBoundingClientRect(); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#1B4965"; ctx.beginPath(); ctx.moveTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)); c.dataset.drawing = "1"; c.setPointerCapture(e.pointerId); }}
                          onPointerMove={e => { const c = e.target; if (c.dataset.drawing !== "1") return; const ctx = c.getContext("2d"), r = c.getBoundingClientRect(); ctx.lineTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)); ctx.stroke(); }}
                          onPointerUp={e => { e.target.dataset.drawing = "0"; }}
                        />
                        <button onClick={() => { const c = document.getElementById("signatureCanvas"); if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height); }} style={{ background: "none", border: "none", color: "#8896A6", fontSize: 11, cursor: "pointer" }}>🗑️ 清除</button>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#D4880F", marginBottom: 4, marginTop: 6 }}>✍️ 對方簽名（請將手機交給對方）</div>
                        <canvas id="signatureCanvas2" width="280" height="70" style={{ border: "1.5px solid #D4880F", borderRadius: 8, background: "#FFFCF5", touchAction: "none", width: "100%", height: 70, cursor: "crosshair" }}
                          onPointerDown={e => { const c = e.target, ctx = c.getContext("2d"), r = c.getBoundingClientRect(); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#D4880F"; ctx.beginPath(); ctx.moveTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)); c.dataset.drawing = "1"; c.setPointerCapture(e.pointerId); }}
                          onPointerMove={e => { const c = e.target; if (c.dataset.drawing !== "1") return; const ctx = c.getContext("2d"), r = c.getBoundingClientRect(); ctx.lineTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)); ctx.stroke(); }}
                          onPointerUp={e => { e.target.dataset.drawing = "0"; }}
                        />
                        <button onClick={() => { const c = document.getElementById("signatureCanvas2"); if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height); }} style={{ background: "none", border: "none", color: "#8896A6", fontSize: 11, cursor: "pointer" }}>🗑️ 清除</button>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#8896A6", marginBottom: 8, background: "#F7F9FC", padding: "8px 10px", borderRadius: 6 }}>⚠️ 確認交接後將記錄您的帳號資訊、交接時間、GPS位置，作為日後爭議處理依據。</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => submitHandover(p.id)} style={{ ...S.resolveBtn, flex: 1, marginTop: 0, padding: "10px", fontSize: 13 }}>✅ 確認交接</button>
                      <button onClick={() => setShowHandoverForm(false)} style={{ ...S.deleteBtn, flex: 1, marginTop: 0, padding: "10px", fontSize: 13 }}>取消</button>
                    </div>
                  </div>
                )}
                {((owner && handoverStatus.owner) || (!owner && handoverStatus.claimant)) && (
                  <div style={{ textAlign: "center", color: "#8896A6", fontSize: 12, marginTop: 4 }}>{t.handoverWait}</div>
                )}
                </>
              )}
            </div>
          )}

          {/* Expired notice */}
          {isExpired(p) && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFEBEE", border: "1.5px solid #EF9A9A", borderRadius: 10, fontSize: 13, color: "#C62828", textAlign: "center" }}>{t.expiredNotice}</div>
          )}
          {!p.resolved && !isExpired(p) && daysUntilExpire(p) <= 30 && owner && (
            <div style={{ marginTop: 8, padding: "10px 14px", background: "#FFF3E0", border: "1.5px solid #FFB74D", borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: "#E65100", fontWeight: 700 }}>⏰ 還有 {daysUntilExpire(p)} 天將自動過期</div>
              <div style={{ fontSize: 11, color: "#5A7184", marginTop: 4 }}>如果已經找到，請點「✅ 我已找回物品」更新狀態</div>
            </div>
          )}
          {!p.resolved && !isExpired(p) && daysUntilExpire(p) <= 30 && !owner && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#D4880F", textAlign: "center" }}>⏰ 此貼文將在 {daysUntilExpire(p)} 天後過期</div>
          )}

          {/* Rating button - show for resolved posts with approved claim, even without handover */}
          {p.resolved && postClaims.some(c => c.status === "approved") && (owner || hasApprovedClaim(p)) && !handoverStatus.owner && !handoverStatus.claimant && (
            userRatings.some(r => r.postId === p.id) ? (
              <div style={{ textAlign: "center", marginTop: 12, padding: "10px", background: "#F0FFF4", borderRadius: 10, fontSize: 13, color: "#2D8A5E", fontWeight: 600 }}>✅ 已完成評價</div>
            ) : (
              <button onClick={() => {
                const approved = postClaims.find(c => c.status === "approved");
                if (owner && approved) setRatingTarget({ uid: approved.claimantUid, name: approved.claimantName });
                else if (!owner) setRatingTarget({ uid: p.authorUid, name: p.authorName });
                else { alert("找不到評價對象"); return; }
                setRatingStars(0); setShowRating(true);
              }} style={{ ...S.claimBtn, marginTop: 12, background: "linear-gradient(135deg, #D4880F, #E9A825)" }}>⭐ {t.rateTitle}</button>
            )
          )}
        </div>

        {/* 7-day police report reminder for found items */}
        {(() => {
          const ageDays = p.createdAt?.toDate ? (Date.now() - p.createdAt.toDate().getTime()) / 86400000 : 0;
          const isFoundItem = p.category === "found" || (p.category === "wrong" && p.wrongType === "took") || (["wallet", "id_doc", "electronics", "keys"].includes(p.category) && p.postType === "found");
          if (!p.resolved && isFoundItem && ageDays >= 7 && isOwner(p)) {
            return (
              <div style={{ margin: "0 16px 12px", padding: 14, background: "#FFF3E0", borderRadius: 12, border: "1.5px solid #FFB74D" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E65100", marginBottom: 6 }}>⚠️ 建議儘速報警處理</div>
                <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 1.8, marginBottom: 10 }}>
                  您的拾獲物已超過 7 天未找到失主。依民法第 803 條，拾得遺失物應通知失主或報告警察機關。長期持有他人財物可能涉及法律風險。
                </div>
                <button onClick={() => window.open("https://www.npa.gov.tw/ch/app/folder/389", "_blank")} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #E65100, #FF8F00)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🚔 查詢就近警察局</button>
              </div>
            );
          }
          return null;
        })()}

        {/* Fraud warning */}
        <div style={{ margin: "0 16px 12px", padding: 14, background: "#FFEBEE", borderRadius: 12, border: "1px solid #FFCDD2" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#C62828", marginBottom: 8 }}>🛡️ 防詐安全提醒</div>
          <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 2 }}>
            <div>🚫 見面前不要匯款、轉帳或支付任何費用</div>
            <div>🚫 不點擊不明網址，不提供密碼或 OTP 驗證碼</div>
            <div>✅ 選擇公共場所面交，使用平台紀錄單保障權益</div>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#C62828", fontWeight: 600 }}>📞 可疑情況請撥 165 反詐騙專線</div>
        </div>

        {/* Pet help button - show contact after click */}
        {PET_CATS.includes(p.category) && !p.resolved && !owner && user && (
        <div style={{ margin: "0 16px 12px" }}>
          {!p._showPetContact ? (
            <button onClick={() => {
              const updated = { ...p, _showPetContact: true };
              setSelectedPost(updated);
              // Notify post owner
              addDoc(collection(db, "userNotifs"), {
                targetUid: p.authorUid, type: "pet_help", from: user.name,
                postId: p.id, postTitle: p.title, read: false,
                createdAt: serverTimestamp(),
              }).catch(() => {});
            }} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7B4BB2, #9C27B0)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(123,75,178,0.3)" }}>
              🐾 我要協尋
            </button>
          ) : (
            <div style={{ padding: 14, background: "#F3E5F5", borderRadius: 14, border: "1.5px solid #CE93D8" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#7B4BB2", marginBottom: 8 }}>📞 飼主聯絡方式</div>
              {p.petLine && <div style={{ fontSize: 13, color: "#1B4965", marginBottom: 4 }}>💬 LINE：<strong>{p.petLine}</strong></div>}
              {p.petPhone && <div style={{ fontSize: 13, color: "#1B4965", marginBottom: 4 }}>📱 電話：<a href={"tel:" + p.petPhone} style={{ color: "#1B4965", fontWeight: 700, textDecoration: "none" }}>{p.petPhone}</a></div>}
              {!p.petLine && !p.petPhone && <div style={{ fontSize: 12, color: "#8896A6" }}>飼主未提供聯絡方式，請使用聊天功能聯繫</div>}
              <div style={{ fontSize: 11, color: "#8896A6", marginTop: 8 }}>⚠️ 請勿騷擾飼主，如有發現請盡速聯繫</div>
            </div>
          )}
        </div>
        )}

        {/* Similar posts / cross-reference */}
        {(() => {
          const sim = findSimilarPosts(p);
          const hasAny = sim.posts.length > 0 || sim.shelter.length > 0 || sim.lostPets.length > 0;
          if (!hasAny) return null;
          return (
            <div style={{ margin: "0 16px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1B4965", marginBottom: 10 }}>🔍 可能相關的資訊</div>

              {sim.posts.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2D8A5E", marginBottom: 6 }}>📋 平台上的相似貼文</div>
                  {sim.posts.map(sp => (
                    <div key={sp.id} onClick={() => { setSelectedPost(sp); window.scrollTo(0, 0); }} style={{ padding: "10px 12px", background: "#F7F9FC", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: "1px solid #EEF2F7" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {sp.photos?.[0] && <img src={sp.photos[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965" }}>{sp.title}</div>
                          <div style={{ fontSize: 11, color: "#5A7184" }}>{sp.locationText || sp.airport || ""} · {sp.date}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: sp.postType === "found" ? "#E8F5E9" : "#FFF3E0", color: sp.postType === "found" ? "#2D8A5E" : "#E65100" }}>{sp.postType === "found" ? "拾獲" : "遺失"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sim.lostPets.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#E05A33", marginBottom: 6 }}>🔍 政府走失寵物通報（相似）</div>
                  {sim.lostPets.map((a, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: "#FFF3E0", borderRadius: 10, marginBottom: 6, border: "1px solid #FFE0B2" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {a.photo && <img src={proxyImg(a.photo)} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#E05A33" }}>{a.petName || a.petKind} · {a.breed}</div>
                          <div style={{ fontSize: 11, color: "#5A7184" }}>🎨 {a.color} · 📍 {(a.lostPlace || "").substring(0, 20)}</div>
                          <div style={{ fontSize: 10, color: "#8896A6" }}>遺失：{a.lostDate} · {a.ownerName}</div>
                        </div>
                        {a.phone && <a href={"tel:" + a.phone} onClick={e => e.stopPropagation()} style={{ padding: "4px 8px", borderRadius: 6, background: "#E05A33", color: "#fff", fontSize: 10, fontWeight: 700, textDecoration: "none" }}>📞</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sim.shelter.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#7B4BB2", marginBottom: 6 }}>🏠 收容所相似動物</div>
                  {sim.shelter.map((a, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: "#F3E5F5", borderRadius: 10, marginBottom: 6, border: "1px solid #CE93D8" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {a.album_file && <img src={proxyImg(a.album_file)} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#7B4BB2" }}>{a.animal_kind} · {a.animal_sex === "M" ? "公" : a.animal_sex === "F" ? "母" : ""} · {a.animal_colour}</div>
                          <div style={{ fontSize: 11, color: "#5A7184" }}>📍 {(a.animal_foundplace || "").substring(0, 20)}</div>
                          <div style={{ fontSize: 10, color: "#8896A6" }}>{a.shelter_name}</div>
                        </div>
                        {a.shelter_tel && <a href={"tel:" + a.shelter_tel} onClick={e => e.stopPropagation()} style={{ padding: "4px 8px", borderRadius: 6, background: "#7B4BB2", color: "#fff", fontSize: 10, fontWeight: 700, textDecoration: "none" }}>📞</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 10, color: "#B0BEC5", textAlign: "center", marginTop: 6 }}>依類別、地點、毛色等欄位自動比對</div>
            </div>
          );
        })()}

        {/* Shelter animals search for pets */}
        {PET_CATS.includes(p.category) && !p.resolved && (
        <div style={{ margin: "0 16px 12px" }}>
          <button onClick={() => fetchShelterAnimals(p)} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "2px solid #7B4BB2", background: "#7B4BB210", color: "#7B4BB2", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            🏠 查詢附近收容所（政府開放資料）
          </button>
          <div style={{ fontSize: 11, color: "#8896A6", textAlign: "center", marginTop: 6 }}>資料來源：農業部動物認領養開放平台 · 每日更新</div>
        </div>
        )}

        {/* Handover flow guide */}
        {!p.resolved && !p.hidden && (
        <div style={{ margin: "0 16px 12px", padding: 14, background: "#E3F2FD", borderRadius: 12, border: "1px solid #BBDEFB" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📦 交接流程說明</div>
          <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 2.2 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ background: "#1B4965", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>1</span><span>通過<strong>防冒領驗證</strong>後，雙方開始聊天溝通</span></div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ background: "#1B4965", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>2</span><span>約定<strong>公共場所面交</strong>（推薦：車站、超商、警局）</span></div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ background: "#1B4965", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>3</span><span>面交完成後，<strong>雙方各自</strong>點擊「📦 確認交接」</span></div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ background: "#2D8A5E", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>4</span><span>雙方都確認 → 自動產生<strong>交接紀錄單</strong>，貼文標記「已尋回」</span></div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ background: "#D4880F", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>5</span><span>互相給予<strong>⭐ 評價</strong>，完成！</span></div>
          </div>
          <div style={{ marginTop: 8, padding: "8px 10px", background: "#fff", borderRadius: 8, fontSize: 11, color: "#5A7184" }}>
            <div>💡 <strong>交接保障機制：</strong>任一方確認後 48 小時，對方未確認將自動完成交接</div>
            <div style={{ marginTop: 2 }}>💡 <strong>感謝金：</strong>非強制性，面交時現場給予即可，平台不經手金錢</div>
          </div>
        </div>
        )}

        {/* Replies */}
        <div style={{ ...S.repliesSection, maxWidth: desktopWide ? "100%" : 720 }}>
          <h3 style={S.repliesTitle}>{t.replies} ({postReplies.length})</h3>
          {postReplies.length === 0 && <p style={{ color: "#8896A6", fontSize: 14, textAlign: "center", padding: 20 }}>{t.noReplies}</p>}
          {postReplies.map((r) => (
            <div key={r.id} style={S.replyBubble}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "#1B4965", fontSize: 13 }}>{r.author}</span>
                <span style={{ color: "#8896A6", fontSize: 12 }}>{r.createdAt?.toDate?.()?.toLocaleString("zh-TW") || r.time || "剛剛"}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#2C3E50", lineHeight: 1.5 }}>{r.text}</p>
            </div>
          ))}
          {user && (
            <div style={S.replyInputRow}>
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={t.replyPlaceholder} maxLength={500} style={S.replyInput} onKeyDown={e => e.key === "Enter" && addReply(p.id)} />
              <button onClick={() => addReply(p.id)} style={S.sendBtn}>{ t.send }</button>
            </div>
          )}
        </div>

        {/* Ad after replies */}
        {showHomeAds && <AdBanner style={{ margin: "0 16px 16px", maxWidth: 720 }} />}

        {/* Claim Modal */}
        {showClaimModal && (
          <div style={S.modalOverlay}><div style={{ ...S.modalCard, maxHeight: "85vh", overflowY: "auto" }}>
            {!claimSubmitted ? (<>
              <h3 style={S.modalTitle}>🔑 提交認領申請</h3>
              <p style={S.modalDesc}>請回答驗證問題，證明您是物品主人。</p>
              <div style={S.warningBox}><span>⚠️</span><span style={{ fontSize: 12, color: "#8B6914" }}>冒領他人物品涉及刑法詐欺及侵占罪。</span></div>
              {(p.verifyQuestions || []).map((vq, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <label style={{ ...S.label, color: "#E05A33" }}>驗證題 {i + 1}：{vq.q}</label>
                  <input value={claimAnswers[i] || ""} onChange={e => { const a = [...claimAnswers]; a[i] = e.target.value; setClaimAnswers(a); }} placeholder={t.yourAnswer} style={S.input} />
                </div>
              ))}
              <button onClick={submitClaim} style={{ ...S.modalPrimaryBtn, opacity: claimAnswers.every(a => a?.trim()) ? 1 : 0.5 }}>📤 送出</button>
              <button onClick={() => setShowClaimModal(false)} style={S.modalSecondaryBtn}>取消</button>
            </>) : (<>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>{claimAutoApproved ? "🎉" : "📨"}</div>
              <h3 style={S.modalTitle}>{claimAutoApproved ? "✅ 驗證通過！" : "申請已送出"}</h3>
              <p style={S.modalDesc}>{claimAutoApproved ? "答案正確！系統已自動確認，您可以查看聯絡方式並開始聊天。" : "等待發文者審核中。"}</p>
              <button onClick={() => { setShowClaimModal(false); setClaimAutoApproved(false); }} style={S.modalPrimaryBtn}>好的</button>
            </>)}
          </div></div>
        )}

        {/* Resolve Modal */}
        {showResolveModal && (
          <div style={S.modalOverlay}><div style={S.modalCard}>
            {resolveStep === "confirm" && (<>
              <h3 style={S.modalTitle}>🎉 {t.resolveConfirm}</h3>
              <p style={{ fontSize: 13, color: "#5A7184", marginBottom: 16, textAlign: "center" }}>請選擇找回方式：</p>
              <button onClick={async () => {
                await confirmResolve();
                setResolveStep("handover");
              }} style={{ ...S.modalPrimaryBtn, marginBottom: 8 }}>🤝 透過平台找回（有認領者）</button>
              <button onClick={async () => {
                try {
                  await updateDoc(doc(db, "posts", selectedPost.id), { resolved: true, selfFound: true, resolvedAt: serverTimestamp() });
                  setResolveStep("thanks");
                } catch(e) { alert("更新失敗"); }
              }} style={{ ...S.modalPrimaryBtn, background: "linear-gradient(135deg, #5A7184, #8896A6)", marginBottom: 8 }}>🙋 自己找到了</button>
              <button onClick={() => setShowResolveModal(false)} style={S.modalSecondaryBtn}>取消</button>
            </>)}
            {resolveStep === "handover" && (<>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>📦</div>
              <h3 style={{ ...S.modalTitle, textAlign: "center" }}>確認交接</h3>
              <p style={{ fontSize: 13, color: "#5A7184", textAlign: "center", marginBottom: 16 }}>填寫交接資料，雙方確認後生成完整紀錄單</p>
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#1B4965", display: "block", marginBottom: 8 }}>交接方式</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button type="button" onClick={() => setHandoverFaceToFace(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: !handoverFaceToFace ? "2.5px solid #1B4965" : "1.5px solid #DDE4EC", background: !handoverFaceToFace ? "#1B496510" : "#fff", cursor: "pointer" }}>
                    <div style={{ fontSize: 18 }}>📦</div>
                    <div style={{ fontSize: 12, fontWeight: !handoverFaceToFace ? 700 : 500, color: !handoverFaceToFace ? "#1B4965" : "#5A7184", marginTop: 4 }}>寄送/遠端</div>
                  </button>
                  <button type="button" onClick={() => setHandoverFaceToFace(true)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: handoverFaceToFace ? "2.5px solid #2D8A5E" : "1.5px solid #DDE4EC", background: handoverFaceToFace ? "#2D8A5E10" : "#fff", cursor: "pointer" }}>
                    <div style={{ fontSize: 18 }}>🤝</div>
                    <div style={{ fontSize: 12, fontWeight: handoverFaceToFace ? 700 : 500, color: handoverFaceToFace ? "#2D8A5E" : "#5A7184", marginTop: 4 }}>面對面</div>
                  </button>
                </div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#1B4965", display: "block", marginBottom: 6 }}>📝 交接備註</label>
                <textarea value={handoverNote} onChange={e => setHandoverNote(e.target.value)} placeholder="描述交接狀況、物品狀態⋯" style={{ ...S.textarea, fontSize: 13, padding: "8px 12px", minHeight: 60, marginBottom: 10 }} />
                <label style={{ fontSize: 13, fontWeight: 600, color: "#1B4965", display: "block", marginBottom: 6 }}>📷 交接照片（選填）</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setHandoverPhoto(ev.target.result);
                  reader.readAsDataURL(file);
                }} style={{ fontSize: 13, marginBottom: 8 }} />
                {handoverPhoto && <img src={handoverPhoto} alt="preview" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
                {handoverFaceToFace && (<>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#1B4965", display: "block", marginBottom: 6 }}>✍️ 我的簽名</label>
                <canvas id="signatureCanvas" width="280" height="80" style={{ border: "1.5px solid #DDE4EC", borderRadius: 8, background: "#fff", touchAction: "none", width: "100%", height: 80, cursor: "crosshair" }}
                  onPointerDown={e => {
                    const canvas = e.target; const ctx = canvas.getContext("2d");
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#1B4965";
                    ctx.beginPath(); ctx.moveTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height));
                    canvas.dataset.drawing = "1"; canvas.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={e => {
                    const canvas = e.target; if (canvas.dataset.drawing !== "1") return;
                    const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect();
                    ctx.lineTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height)); ctx.stroke();
                  }}
                  onPointerUp={e => { e.target.dataset.drawing = "0"; }}
                />
                <button onClick={() => { const c = document.getElementById("signatureCanvas"); if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height); }} style={{ background: "none", border: "none", color: "#8896A6", fontSize: 11, cursor: "pointer", marginTop: 2, marginBottom: 10 }}>🗑️ 清除</button>

                <label style={{ fontSize: 13, fontWeight: 600, color: "#1B4965", display: "block", marginBottom: 6 }}>✍️ 對方簽名（面對面交接時，請將手機交給對方簽名）</label>
                <canvas id="signatureCanvas2" width="280" height="80" style={{ border: "1.5px solid #D4880F", borderRadius: 8, background: "#FFFCF5", touchAction: "none", width: "100%", height: 80, cursor: "crosshair" }}
                  onPointerDown={e => {
                    const canvas = e.target; const ctx = canvas.getContext("2d");
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#D4880F";
                    ctx.beginPath(); ctx.moveTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height));
                    canvas.dataset.drawing = "1"; canvas.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={e => {
                    const canvas = e.target; if (canvas.dataset.drawing !== "1") return;
                    const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect();
                    ctx.lineTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height)); ctx.stroke();
                  }}
                  onPointerUp={e => { e.target.dataset.drawing = "0"; }}
                />
                <button onClick={() => { const c = document.getElementById("signatureCanvas2"); if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height); }} style={{ background: "none", border: "none", color: "#8896A6", fontSize: 11, cursor: "pointer", marginTop: 2 }}>🗑️ 清除</button>
                </>)}
              </div>
              <div style={{ background: "#FFF8E1", borderRadius: 10, padding: 10, fontSize: 12, color: "#E65100", marginBottom: 12 }}>
                ⚠️ 交接紀錄單具有法律參考效力，請確實填寫
              </div>
              <button onClick={async () => {
                try {
                  await confirmHandover(selectedPost.id);
                  setResolveStep("thanks");
                } catch(e) { alert("交接確認失敗：" + e.message); }
              }} style={{ ...S.modalPrimaryBtn, marginBottom: 8 }}>✅ 確認交接並繼續</button>
              <button onClick={() => setResolveStep("thanks")} style={S.modalSecondaryBtn}>先跳過，稍後再確認</button>
            </>)}
            {resolveStep === "thanks" && (<>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🎉</div>
              <h3 style={{ ...S.modalTitle, textAlign: "center" }}>恭喜找回物品！</h3>
              <p style={{ fontSize: 13, color: "#5A7184", textAlign: "center", marginBottom: 16, lineHeight: 1.6 }}>物品已標記為找回！建議完成以下步驟：</p>
              <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965" }}>給對方評價</div>
                    <div style={{ fontSize: 12, color: "#5A7184" }}>評價能幫助其他用戶判斷對方的可信度</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📤</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965" }}>分享成功故事</div>
                    <div style={{ fontSize: 12, color: "#5A7184" }}>讓更多人知道 What'sfind 幫你找回物品</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setResolveStep("donate")} style={{ ...S.modalPrimaryBtn, marginBottom: 8 }}>繼續</button>
              <button onClick={() => setShowResolveModal(false)} style={S.modalSecondaryBtn}>關閉</button>
            </>)}
            {resolveStep === "donate" && (<>
              <h3 style={S.modalTitle}>☕ 請作者喝杯咖啡</h3>
              <p style={S.modalDesc}>您的支持是我們持續運作的動力</p>
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#5A7184", lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 6, fontSize: 13 }}>💡 您的贊助用在哪裡？</div>
                <div>☁️ 主機與網域維護費用</div>
                <div>🛠️ 開發工具與服務費用</div>
                <div>🚀 新功能開發與升級</div>
                <div style={{ marginTop: 6, fontSize: 11, color: "#8896A6" }}>What'sfind 是完全免費的平台，您的一杯咖啡就是我們最大的動力。</div>
              </div>
              <p style={{ fontSize: 13, color: "#5A7184", marginBottom: 8 }}>使用 iPASS MONEY 或 LINE 掃描 QR Code</p>
              <img src="/donate-qr.jpg" alt="贊助 QR Code" style={{ width: "60%", maxWidth: 180, borderRadius: 12, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} />
              <button onClick={async () => {
                try {
                  const res = await fetch("/donate-qr.jpg");
                  const blob = await res.blob();
                  const file = new File([blob], "whatsfind-donate-qr.jpg", { type: "image/jpeg" });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: "What'sfind 贊助 QR Code" });
                  } else {
                    setLightbox({ photos: ["/donate-qr.jpg"], index: 0 });
                    alert("📱 長按圖片即可儲存到相簿");
                  }
                } catch(e) {
                  setLightbox({ photos: ["/donate-qr.jpg"], index: 0 });
                  alert("📱 長按圖片即可儲存到相簿");
                }
              }} style={{ ...S.modalPrimaryBtn, background: "linear-gradient(135deg, #1B4965, #2D6E9E)", marginBottom: 8 }}>💾 儲存 QR Code</button>
              <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 8, fontSize: 11, color: "#5A7184", lineHeight: 1.8, marginBottom: 12 }}>
                📱 手機操作：長按圖片儲存 → 開啟 iPASS MONEY → 掃描 → 從相簿選擇
              </div>
              <button onClick={() => setShowResolveModal(false)} style={S.modalSecondaryBtn}>{t.skipDonate}</button>
            </>)}
          </div></div>
        )}

        {/* Share Success Card Modal */}
        {showShareCard && (
          <div style={S.modalOverlay} onClick={() => setShowShareCard(false)}>
            <div style={{ ...S.modalCard, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>📤 分享成功故事</h3>
                <button onClick={() => setShowShareCard(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
              </div>
              <img ref={shareCardRef} alt="share" style={{ width: "100%", borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={async () => {
                  const img = shareCardRef.current;
                  if (!img) return;
                  try {
                    const res = await fetch(img.src);
                    const blob = await res.blob();
                    const file = new File([blob], "whatsfind-success.png", { type: "image/png" });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({ files: [file], title: "What'sfind 成功找回物品" });
                    } else {
                      const a = document.createElement("a"); a.href = img.src; a.download = "whatsfind-success.png"; a.click();
                    }
                  } catch(e) {
                    window.open(img.src, "_blank");
                  }
                }} style={{ ...S.modalPrimaryBtn, flex: 1, marginBottom: 0, fontSize: 13 }}>💾 儲存圖片</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <button onClick={() => { window.open("https://line.me/R/share?text=" + encodeURIComponent("🎉 我透過 What'sfind 成功找回遺失物品！推薦給你 👉 https://whatsfind-app.vercel.app"), "_blank"); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#06C755", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 70 }}>LINE</button>
                <button onClick={() => { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://whatsfind-app.vercel.app") + "&quote=" + encodeURIComponent("🎉 我透過 What'sfind 成功找回遺失物品！"), "_blank"); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#1877F2", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 70 }}>Facebook</button>
                <button onClick={() => { window.open("https://www.threads.net/intent/post?text=" + encodeURIComponent("🎉 我透過 What'sfind 成功找回遺失物品！推薦給你 👉 https://whatsfind-app.vercel.app"), "_blank"); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#000", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 70 }}>Threads</button>
                <button onClick={() => { const text = "🎉 我透過 What'sfind 成功找回遺失物品！推薦給你 👉 https://whatsfind-app.vercel.app"; navigator.clipboard.writeText(text).then(() => alert("已複製！貼到 Instagram 限動")); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 70 }}>IG</button>
                <button onClick={() => {
                  const text = "🎉 我透過 What'sfind 成功找回遺失物品！推薦給你 👉 https://whatsfind-app.vercel.app";
                  if (navigator.share) { navigator.share({ title: "What'sfind", text, url: "https://whatsfind-app.vercel.app" }).catch(() => {}); }
                  else { navigator.clipboard.writeText(text).then(() => alert("已複製到剪貼簿！")); }
                }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#1B4965", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 70 }}>更多</button>
              </div>
            </div>
          </div>
        )}

        {/* Author Profile Modal */}
        {authorProfile && (
          <div style={S.modalOverlay} onClick={() => setAuthorProfile(null)}>
            <div style={{ ...S.modalCard, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>👤 用戶資料</h3>
                <button onClick={() => setAuthorProfile(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
              </div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <AvatarCircle name={authorProfile.name} avatar={authorProfile.avatar} size={56} />
                <h3 style={{ margin: "10px 0 4px", color: "#1B4965", fontSize: 18 }}>{authorProfile.name}</h3>
                {isAdmin && <p onClick={() => { navigator.clipboard.writeText(authorProfile.uid); alert("UID 已複製！"); }} style={{ margin: "0 0 6px", fontSize: 11, color: "#8896A6", cursor: "pointer", wordBreak: "break-all" }}>🔑 {authorProfile.uid} <span style={{ fontSize: 10, color: "#B0BEC5" }}>（點擊複製）</span></p>}
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 10, background: authorProfile.score >= 80 ? "#2D8A5E14" : authorProfile.score >= 50 ? "#D4880F14" : "#E05A3314", color: authorProfile.score >= 80 ? "#2D8A5E" : authorProfile.score >= 50 ? "#D4880F" : "#E05A33" }}>
                  {authorProfile.score >= 80 ? "🏆" : authorProfile.score >= 50 ? "⚠️" : "❌"} 信用 {authorProfile.score} 分
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1B4965" }}>{authorProfile.postCount}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>發文</div>
                </div>
                <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#2D8A5E" }}>{authorProfile.resolvedCount}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>尋回</div>
                </div>
                <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#D4880F" }}>⭐ {authorProfile.avg}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>{authorProfile.ratingCount} 評價</div>
                </div>
              </div>
              {authorProfile.ratings?.length > 0 && (
                <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 12, borderTop: "1px solid #EEF2F7", paddingTop: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 6 }}>收到的評價：</div>
                  {authorProfile.ratings.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 12 }}>
                      <span style={{ color: "#5A7184" }}>{r.raterName || "匿名用戶"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{"⭐".repeat(r.stars)}</span>
                        {isAdmin && r.id && <button onClick={async () => {
                          if (!confirm("刪除此評價？")) return;
                          try {
                            await deleteDoc(doc(db, "ratings", r.id));
                            setAuthorProfile(prev => ({ ...prev, ratings: prev.ratings.filter((_, j) => j !== i) }));
                            logAdminAction("刪除評價", "目標：" + authorProfile.name + "，評價者：" + r.raterName + "，" + r.stars + "星");
                          } catch(e) { alert("刪除失敗"); }
                        }} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>刪除</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isAdmin && authorProfile.uid !== user.uid && (
                <div style={{ borderTop: "1px solid #EEF2F7", paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>👑 管理員操作</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => {
                      const count = parseInt(prompt("給予幾次免費置頂？", "1"));
                      if (!count || count <= 0) return;
                      try {
                        const rDoc = await getDoc(doc(db, "referrals", authorProfile.uid));
                        if (!rDoc.exists()) {
                          await setDoc(doc(db, "referrals", authorProfile.uid), { code: authorProfile.uid.substring(0, 8).toUpperCase(), count: count, referredBy: null });
                        } else {
                          await updateDoc(doc(db, "referrals", authorProfile.uid), { count: increment(count) });
                        }
                        logAdminAction("給予置頂獎勵", authorProfile.uid + " +" + count + "次");
                        alert("已給予 " + authorProfile.name + " " + count + " 次免費置頂！");
                      } catch(e) { alert("失敗：" + e.message); }
                    }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#D4880F", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📌 給予置頂</button>
                    <button onClick={async () => {
                      if (!confirm("確定要封鎖 " + authorProfile.name + "？")) return;
                      try {
                        await setDoc(doc(db, "config", "blockedUsers"), { list: [...blockedUsers, authorProfile.uid] });
                        logAdminAction("封鎖用戶", authorProfile.name + " " + authorProfile.uid);
                        alert("已封鎖 " + authorProfile.name);
                      } catch(e) { alert("失敗：" + e.message); }
                    }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#E05A33", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚫 封鎖用戶</button>
                  </div>
                </div>
              )}
              <button onClick={() => setAuthorProfile(null)} style={S.modalPrimaryBtn}>關閉</button>
            </div>
          </div>
        )}

        {/* Photo Lightbox */}
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 301, padding: "env(safe-area-inset-top, 10px) 10px 10px 10px" }}>✕</button>
            <div style={{ position: "relative", display: "inline-block" }} onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.photos[lightbox.index]} alt="" style={{ maxWidth: "90vw", maxHeight: "75vh", borderRadius: 8, objectFit: "contain" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} onContextMenu={e => e.preventDefault()} />
            </div>
            {lightbox.photos.length > 1 && (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: Math.max(0, prev.index - 1) })); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 24, padding: "8px 16px", borderRadius: 10, cursor: "pointer", opacity: lightbox.index === 0 ? 0.3 : 1 }}>◀</button>
                <span style={{ color: "#fff", fontSize: 14, alignSelf: "center" }}>{lightbox.index + 1} / {lightbox.photos.length}</span>
                <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: Math.min(prev.photos.length - 1, prev.index + 1) })); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 24, padding: "8px 16px", borderRadius: 10, cursor: "pointer", opacity: lightbox.index === lightbox.photos.length - 1 ? 0.3 : 1 }}>▶</button>
              </div>
            )}
            {lightbox.photos.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {lightbox.photos.map((src, i) => (
                  <img key={i} src={src} alt="" onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: i })); }} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", cursor: "pointer", border: i === lightbox.index ? "2px solid #fff" : "2px solid transparent", opacity: i === lightbox.index ? 1 : 0.5 }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rating Modal */}
        {showRating && ratingTarget && (
          <div style={S.modalOverlay}><div style={S.modalCard}>
            <h3 style={S.modalTitle}>⭐ {t.rateTitle}</h3>
            <p style={S.modalDesc}>{t.rateDesc}：{ratingTarget.name}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRatingStars(s)} style={{ fontSize: 32, background: "none", border: "none", cursor: "pointer", opacity: s <= ratingStars ? 1 : 0.3 }}>⭐</button>
              ))}
            </div>
            <button onClick={() => submitRating(p.id, ratingTarget.uid, ratingTarget.name)} style={{ ...S.modalPrimaryBtn, opacity: ratingStars > 0 ? 1 : 0.5 }}>{t.submit}</button>
            <button onClick={() => setShowRating(false)} style={S.modalSecondaryBtn}>{t.cancel}</button>
          </div></div>
        )}

        {/* Receipt Preview Modal */}
        {receiptImage && (
          <div style={S.modalOverlay} onClick={() => setReceiptImage(null)}>
            <div style={{ ...S.modalCard, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>📄 交接紀錄單</h3>
                <button onClick={() => setReceiptImage(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
              </div>
              <img src={receiptImage} alt="交接紀錄單" style={{ width: "100%", borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => {
                  try {
                    const res = await fetch(receiptImage);
                    const blob = await res.blob();
                    const file = new File([blob], "whatsfind-receipt.png", { type: "image/png" });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({ files: [file], title: "What'sfind 交接紀錄單" });
                      alert("✅ 已分享！");
                    } else {
                      setLightbox({ photos: [receiptImage], index: 0 });
                      setReceiptImage(null);
                      alert("📱 長按圖片即可儲存到相簿");
                    }
                  } catch(e) {
                    if (e.name !== "AbortError") {
                      setLightbox({ photos: [receiptImage], index: 0 });
                      setReceiptImage(null);
                      alert("📱 長按圖片即可儲存到相簿");
                    }
                  }
                }} style={{ ...S.modalPrimaryBtn, flex: 1, marginBottom: 0 }}>💾 儲存紀錄單</button>
              </div>
              <button onClick={() => setReceiptImage(null)} style={{ ...S.modalSecondaryBtn, marginTop: 8 }}>關閉</button>
            </div>
          </div>
        )}

        {/* Post Share Card Modal (in detail view) */}
        {showPostShareCard && (
          <div style={S.modalOverlay} onClick={() => setShowPostShareCard(null)}>
            <div style={{ ...S.modalCard, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>📤 分享貼文</h3>
                <button onClick={() => setShowPostShareCard(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
              </div>
              <img ref={postShareImgRef} alt="share" style={{ width: "100%", borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => shareImageToSocial("save")} style={{ ...S.modalPrimaryBtn, flex: 1, marginBottom: 0, fontSize: 13 }}>💾 儲存圖片</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => shareImageToSocial("all")} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📤 分享到社群（含圖片）</button>
                <button onClick={() => shareImageToSocial("copy")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#EEF2F7", color: "#1B4965", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📋 複製連結</button>
              </div>
            </div>
          </div>
        )}

        {shelterModal}
        {shelterDetailModal}
      </div>
    );
  }

  // ═══ NEW POST ═══
  if (view === "post") {
    if (!user) return (<div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }}><header style={S.header}><button onClick={() => setView("feed")} style={S.backBtn}>{ t.back }</button><span style={S.headerTitle}>發佈</span><span style={{ width: 48 }} /></header><div style={{ textAlign: "center", padding: "60px 24px" }}><div style={{ fontSize: 52 }}>🔐</div><h2 style={{ color: "#1B4965", marginTop: 16 }}>請先登入</h2><button onClick={() => setView("login")} style={{ ...S.submitBtn, marginTop: 24 }}>前往登入</button></div></div>);
    if (submitted) return (
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "calc(env(safe-area-inset-top, 20px) + 20px)" }}>
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 380 }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: "scaleIn 0.5s ease" }}>🎉</div>
          <h2 style={{ color: "#1B4965", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>發佈成功！</h2>
          <p style={{ color: "#5A7184", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>你的貼文已上線，其他使用者現在可以看到了。有人認領時會透過鈴鐺通知你。</p>
          <div style={{ background: "#F7F9FC", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 10 }}>💡 小提醒</div>
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 2 }}>
              <div>🔔 有人認領時會收到通知</div>
              <div>🛡️ 驗證題會保護你的物品不被冒領</div>
              <div>💬 可透過即時聊天聯繫對方</div>
              <div>📤 分享貼文到社群能加速找回</div>
            </div>
          </div>
          {showPetSuccessTips && (
          <div style={{ background: "#F3E5F5", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left", border: "1.5px solid #CE93D8" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7B4BB2", marginBottom: 10 }}>🐾 同時該做的事</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#fff", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#E05A33" }}>📞 打 1959 通報</div>
                <div style={{ fontSize: 10, color: "#5A7184", lineHeight: 1.6, marginTop: 4 }}>動保專線，通報所在縣市的動保處。沒有晶片時尤其重要。</div>
                <a href="tel:1959" style={{ display: "block", marginTop: 6, padding: "4px", background: "#E05A33", color: "#fff", borderRadius: 6, textAlign: "center", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>📞 撥打 1959</a>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1B4965" }}>🏠 問收容所與動物醫院</div>
                <div style={{ fontSize: 10, color: "#5A7184", lineHeight: 1.6, marginTop: 4 }}>沒晶片的毛孩可能被送進收容所。留照片、留特徵，固定回去看。</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 10, gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2D8A5E" }}>💉 找回來之後：植晶片</div>
                <div style={{ fontSize: 10, color: "#5A7184", lineHeight: 1.6, marginTop: 4 }}>晶片 + 寵物登記是免費協尋系統的入場券。這次找回來之後趕快補上，下次就有官方管道可以用了。</div>
              </div>
            </div>
          </div>
          )}
          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <button onClick={() => { setSubmitted(false); setView("feed"); }} style={{ ...S.submitBtn, padding: "14px 0", fontSize: 15, borderRadius: 14 }}>🏠 回到首頁</button>
            <button onClick={() => { setSubmitted(false); resetForm(); }} style={{ ...S.modalSecondaryBtn, padding: "12px 0", fontSize: 14, borderRadius: 14 }}>➕ 再發一篇</button>
          </div>
        </div>
      </div>
    );
    const validQCount = formVerifyQs.filter(v => v.q.trim() && v.a.trim()).length;
    return (
      <div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }}>
        <header style={S.header}><button onClick={() => { setView(editingPost ? "detail" : "feed"); resetForm(); }} style={S.backBtn}>{ t.cancel }</button><span style={S.headerTitle}>{ editingPost ? "✏️ 編輯留言" : t.newPost }</span><span style={{ width: 48 }} /></header>
        <div style={S.formWrap}>
          <label style={S.label}>類型 *</label>
          {/* Group selection */}
          {appMode === "item" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button type="button" onClick={() => { setFormCatGroup("airport"); setFormCat(""); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: formCatGroup === "airport" ? "2.5px solid #E05A33" : "2px solid #DDE4EC", background: formCatGroup === "airport" ? "#E05A3310" : "#fff", cursor: "pointer" }}>
              <img src="/cat-lost.png" alt="" style={{ width: 48, height: 48, objectFit: "contain" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: formCatGroup === "airport" ? "#E05A33" : "#5A7184", marginTop: 4 }}>{t.grpAirport}</div>
            </button>
            <button type="button" onClick={() => { setFormCatGroup("general"); setFormCat(""); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: formCatGroup === "general" ? "2.5px solid #2D8A5E" : "2px solid #DDE4EC", background: formCatGroup === "general" ? "#2D8A5E10" : "#fff", cursor: "pointer" }}>
              <img src="/cat-seeking.png" alt="" style={{ width: 48, height: 48, objectFit: "contain" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: formCatGroup === "general" ? "#2D8A5E" : "#5A7184", marginTop: 4 }}>{t.grpGeneral}</div>
            </button>
          </div>
          )}
          {appMode === "pet" && (
            <div style={{ padding: "8px 12px", background: "#F3E5F5", borderRadius: 10, marginBottom: 12, fontSize: 12, color: "#7B4BB2", fontWeight: 600 }}>🐾 寵物走失/拾獲 — 請選擇寵物類型</div>
          )}
          <div style={S.catGrid}>{CATEGORIES.filter(c => {
            if (appMode === "pet") return PET_CATS.includes(c.id);
            return formCatGroup === "airport" ? AIRPORT_CATS.includes(c.id) : GENERAL_CATS.includes(c.id);
          }).map(c => (<button key={c.id} type="button" onClick={() => setFormCat(c.id)} style={{ ...S.catOption, borderColor: formCat === c.id ? c.color : "#DDE4EC", background: formCat === c.id ? c.color + "12" : "#fff" }}>{c.img ? <img src={c.img} alt="" style={{ width: 44, height: 44, objectFit: "contain" }} /> : <span style={{ fontSize: 22 }}>{c.icon}</span>}<span style={{ fontSize: 12, color: formCat === c.id ? c.color : "#5A7184", fontWeight: formCat === c.id ? 700 : 500 }}>{catLabel(c)}</span></button>))}</div>
          {/* Pet lost/found type */}
          {PET_CATS.includes(formCat) && (
            <div style={{ marginTop: 8, marginBottom: 4 }}>
              <label style={{ ...S.label, fontSize: 13 }}>發文類型 *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setFormPostType("lost")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formPostType === "lost" ? "2.5px solid #E05A33" : "1.5px solid #DDE4EC", background: formPostType === "lost" ? "#E05A3310" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>😢</div>
                  <div style={{ fontSize: 12, fontWeight: formPostType === "lost" ? 700 : 500, color: formPostType === "lost" ? "#E05A33" : "#5A7184", marginTop: 4 }}>我的寵物走失了</div>
                </button>
                <button type="button" onClick={() => setFormPostType("found")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formPostType === "found" ? "2.5px solid #2D8A5E" : "1.5px solid #DDE4EC", background: formPostType === "found" ? "#2D8A5E10" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>🔍</div>
                  <div style={{ fontSize: 12, fontWeight: formPostType === "found" ? 700 : 500, color: formPostType === "found" ? "#2D8A5E" : "#5A7184", marginTop: 4 }}>我發現走失寵物</div>
                </button>
              </div>
              {/* Pet sub-type */}
              {formPostType === "lost" && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => setFormPetSubType("chip")} style={{ flex: 1, padding: "8px", borderRadius: 10, border: formPetSubType === "chip" ? "2px solid #1B4965" : "1.5px solid #DDE4EC", background: formPetSubType === "chip" ? "#1B496510" : "#fff", cursor: "pointer" }}>
                    <div style={{ fontSize: 12, fontWeight: formPetSubType === "chip" ? 700 : 500, color: formPetSubType === "chip" ? "#1B4965" : "#5A7184" }}>💉 有晶片</div>
                    <div style={{ fontSize: 10, color: "#8896A6", marginTop: 2 }}>已向農業部申報</div>
                  </button>
                  <button type="button" onClick={() => setFormPetSubType("no_chip")} style={{ flex: 1, padding: "8px", borderRadius: 10, border: formPetSubType === "no_chip" ? "2px solid #D4880F" : "1.5px solid #DDE4EC", background: formPetSubType === "no_chip" ? "#D4880F10" : "#fff", cursor: "pointer" }}>
                    <div style={{ fontSize: 12, fontWeight: formPetSubType === "no_chip" ? 700 : 500, color: formPetSubType === "no_chip" ? "#D4880F" : "#5A7184" }}>❌ 沒有晶片</div>
                    <div style={{ fontSize: 10, color: "#8896A6", marginTop: 2 }}>在此平台刊登協尋</div>
                  </button>
                </div>
              )}
              {formPostType === "found" && (
                <div style={{ padding: "8px 12px", marginTop: 8, background: "#E8F5E9", borderRadius: 10, fontSize: 11, color: "#2D8A5E" }}>
                  💡 撿到毛孩建議先掃晶片，掃不到就在這裡刊登
                </div>
              )}
            </div>
          )}
          {/* Pet detail fields */}
          {PET_CATS.includes(formCat) && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>🐾 寵物名字</label>
                  <input value={formPetName} onChange={e => setFormPetName(e.target.value)} placeholder={formPostType === "found" ? "不知道可留空" : "例：小黃"} style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>性別</label>
                  <select value={formPetGender} onChange={e => setFormPetGender(e.target.value)} style={{ ...S.select, fontSize: 13, padding: "8px 10px" }}>
                    <option value="">不知道</option>
                    <option value="male">♂ 公</option>
                    <option value="female">♀ 母</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>品種</label>
                  <input value={formPetBreed} onChange={e => setFormPetBreed(e.target.value)} placeholder="例：柴犬、混種貓" style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>🎨 毛色</label>
                  <input value={formPetColor} onChange={e => setFormPetColor(e.target.value)} placeholder="例：黑白、虎斑" style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>年齡</label>
                  <select value={formPetAge} onChange={e => setFormPetAge(e.target.value)} style={{ ...S.select, fontSize: 13, padding: "8px 10px" }}>
                    <option value="">不確定</option>
                    <option value="baby">幼年（&lt;1歲）</option>
                    <option value="young">年輕（1-3歲）</option>
                    <option value="adult">成年（3-7歲）</option>
                    <option value="senior">老年（7歲+）</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 12 }}>體型</label>
                  <select value={formPetSize} onChange={e => setFormPetSize(e.target.value)} style={{ ...S.select, fontSize: 13, padding: "8px 10px" }}>
                    <option value="">不確定</option>
                    <option value="small">小型（&lt;10kg）</option>
                    <option value="medium">中型（10-25kg）</option>
                    <option value="large">大型（25kg+）</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ ...S.label, fontSize: 12 }}>✨ 特徵（越詳細越容易找到）</label>
                <textarea value={formPetFeature} onChange={e => setFormPetFeature(e.target.value)} placeholder="例：右耳缺角、戴紅色項圈、很怕人、尾巴斷掉" style={{ ...S.textarea, fontSize: 13, padding: "8px 10px", minHeight: 50 }} rows={2} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ ...S.label, fontSize: 12 }}>💉 晶片號碼</label>
                <input value={formPetChip} onChange={e => setFormPetChip(e.target.value)} placeholder="沒有可留空（15 碼數字）" style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
              </div>
              {/* Pet contact info */}
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📞 聯絡方式（至少填一個）</div>
                <div style={{ fontSize: 11, color: "#8896A6", marginBottom: 10 }}>點「我要協尋」的人才看得到，不會公開顯示</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...S.label, fontSize: 11 }}>LINE ID</label>
                    <input value={formPetLine} onChange={e => setFormPetLine(e.target.value)} placeholder="選填" style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...S.label, fontSize: 11 }}>📱 電話</label>
                    <input value={formPetPhone} onChange={e => setFormPetPhone(e.target.value)} placeholder="選填" type="tel" style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} />
                  </div>
                </div>
                {!formPetLine && !formPetPhone && <div style={{ fontSize: 11, color: "#E05A33" }}>⚠️ 請至少填寫一種聯絡方式</div>}
              </div>
              {/* Verify toggle */}
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#FFF8E1", borderRadius: 12, border: "1.5px solid #FFE082" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E65100" }}>🛡️ 防冒領驗證題</div>
                    <div style={{ fontSize: 11, color: "#8896A6", marginTop: 2 }}>設定驗證題可防止他人假冒飼主</div>
                  </div>
                  <button type="button" onClick={() => setFormPetSkipVerify(!formPetSkipVerify)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: formPetSkipVerify ? "#EEF2F7" : "#2D8A5E", color: formPetSkipVerify ? "#8896A6" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{formPetSkipVerify ? "不設定" : "✅ 已啟用"}</button>
                </div>
              </div>
            </div>
          )}
          {formCat === "wrong" && (
            <div style={{ marginTop: 8, marginBottom: 4 }}>
              <label style={{ ...S.label, fontSize: 13 }}>誤取類型 *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setFormWrongType("took")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formWrongType === "took" ? "2.5px solid #D4880F" : "1.5px solid #DDE4EC", background: formWrongType === "took" ? "#D4880F10" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>🙋</div>
                  <div style={{ fontSize: 12, fontWeight: formWrongType === "took" ? 700 : 500, color: formWrongType === "took" ? "#D4880F" : "#5A7184", marginTop: 4 }}>我拿錯別人的</div>
                </button>
                <button type="button" onClick={() => setFormWrongType("taken")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formWrongType === "taken" ? "2.5px solid #E05A33" : "1.5px solid #DDE4EC", background: formWrongType === "taken" ? "#E05A3310" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>😰</div>
                  <div style={{ fontSize: 12, fontWeight: formWrongType === "taken" ? 700 : 500, color: formWrongType === "taken" ? "#E05A33" : "#5A7184", marginTop: 4 }}>我的被拿走了</div>
                </button>
              </div>
            </div>
          )}
          {["wallet", "id_doc", "electronics", "keys"].includes(formCat) && (
            <div style={{ marginTop: 8, marginBottom: 4 }}>
              <label style={{ ...S.label, fontSize: 13 }}>發文類型 *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setFormPostType("lost")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formPostType === "lost" ? "2.5px solid #1B4965" : "1.5px solid #DDE4EC", background: formPostType === "lost" ? "#1B496510" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>😰</div>
                  <div style={{ fontSize: 12, fontWeight: formPostType === "lost" ? 700 : 500, color: formPostType === "lost" ? "#1B4965" : "#5A7184", marginTop: 4 }}>我遺失了</div>
                </button>
                <button type="button" onClick={() => setFormPostType("found")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: formPostType === "found" ? "2.5px solid #2D8A5E" : "1.5px solid #DDE4EC", background: formPostType === "found" ? "#2D8A5E10" : "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>🔍</div>
                  <div style={{ fontSize: 12, fontWeight: formPostType === "found" ? 700 : 500, color: formPostType === "found" ? "#2D8A5E" : "#5A7184", marginTop: 4 }}>我撿到了</div>
                </button>
              </div>
              {formPostType === "found" && <div style={{ marginTop: 6, padding: "8px 10px", background: "#FFF8E1", borderRadius: 8, fontSize: 11, color: "#E65100" }}>📢 拾獲物品請同時向警方報案（民法第 803 條）</div>}
            </div>
          )}
          <label style={S.label}>{appMode === "pet" ? "📍 走失/發現地點" : t.location} {(formLocationText.trim() || formLocation || formAirport) ? "" : "*"}</label>
          {appMode === "item" && (
          <select value={formAirport} onChange={e => { setFormAirport(e.target.value); if (e.target.value !== "其他") setFormCustomAirport(""); }} style={S.select}><option value="">{userLocation ? t.nearestAirport : t.selectAirport}</option>{[...sortedAirports, t.other].map((a, i) => <option key={a} value={a}>{userLocation && i === 0 ? "📍 " + a : a}</option>)}</select>
          )}
          {appMode === "item" && formAirport === "其他" && <input value={formCustomAirport} onChange={e => setFormCustomAirport(e.target.value)} placeholder={t.customAirport} style={{ ...S.input, marginTop: 8 }} />}

          {/* Location text input - for pet mode always show, for item mode only specific categories */}
          {(appMode === "pet" || formCat === "found" || formCat === "wallet" || formCat === "id_doc" || formCat === "electronics" || formCat === "keys") && (
            <><label style={S.label}>{appMode === "pet" ? "" : "📍 " + t.customLocation}</label>
            <input value={formLocationText} onChange={e => setFormLocationText(e.target.value)} placeholder={appMode === "pet" ? "例：大安森林公園、信義路二段⋯" : t.locationPlaceholder} style={S.input} />
            {formLocationText.trim() && !formLocation && (
              <button onClick={() => { setMapSearchQuery(formLocationText); setShowMapModal(true); searchLocation(formLocationText); }} type="button" style={{ marginTop: 6, fontSize: 12, color: "#1B4965", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>🗺️ 在地圖上搜尋「{formLocationText}」</button>
            )}
            </>
          )}

          {/* Map location picker */}
          <label style={S.label}>🗺️ 地圖定位（選填）</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => {
              setShowMapModal(true);
              if (!formLocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => { setFormLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setMapSearchQuery(pos.coords.latitude + "," + pos.coords.longitude); },
                  () => {}
                );
              }
            }} type="button" style={{ ...S.filterChip, background: formLocation ? "#2D8A5E" : "#EEF2F7", color: formLocation ? "#fff" : "#1B4965", border: "none", fontSize: 13 }}>
              🗺️ {formLocation ? "已定位 ✓ 點擊修改" : "選擇地點"}
            </button>
            {formLocation && <button onClick={() => { setFormLocation(null); }} type="button" style={{ ...S.filterChip, background: "#EEF2F7", color: "#E05A33", border: "none", fontSize: 13 }}>✕ 清除</button>}
          </div>
          {formLocation && (
            <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 8, height: 120 }}>
              <iframe title="loc" width="100%" height="120" frameBorder="0" style={{ border: 0 }}
                src={"https://maps.google.com/maps?q=" + formLocation.lat + "," + formLocation.lng + "&z=16&output=embed"} />
            </div>
          )}

          {formCatGroup === "airport" && (<>
          {appMode === "item" && <><label style={S.label}>{ t.flight }</label><input value={formFlight} onChange={e => { setFormFlight(e.target.value); autoFillFlight(e.target.value); }} placeholder={t.flightPlaceholder} style={S.input} /></>}
          {flightInfo && (
            <div style={{ marginTop: 6, padding: "6px 10px", background: "#F0F4F8", borderRadius: 8, fontSize: 12, color: "#1B4965", fontWeight: 600 }}>✈️ {flightInfo.airline} {flightInfo.code}</div>
          )}
          </>)}

          {/* Reward - only for lost/wrong items */}
          {(() => {
            // Check if reward should show based on admin settings
            if (appMode === "pet") {
              if (formPostType === "lost") return rewardCats.includes("pet_lost");
              if (formPostType === "found") return rewardCats.includes("pet_found");
              return false;
            }
            if (["wallet", "id_doc", "electronics", "keys"].includes(formCat) && formPostType) return rewardCats.includes("type_" + formPostType);
            if (["wallet", "id_doc", "electronics", "keys"].includes(formCat) && !formPostType) return false;
            return rewardCats.includes(formCat);
          })() && (<>
            <label style={S.label}>{t.reward}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#5A7184", fontWeight: 600 }}>NT$</span>
              <input value={formReward} onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                if (val && parseInt(val) > 10000) { setFormReward("10000"); return; }
                setFormReward(val);
              }} placeholder={t.rewardPlaceholder} style={{ ...S.input, flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {rewardAmounts.map(amt => (
                <button key={amt} type="button" onClick={() => setFormReward(String(amt))} style={{ padding: "6px 14px", borderRadius: 20, border: formReward === String(amt) ? "2px solid #2D8A5E" : "1.5px solid #DDE4EC", background: formReward === String(amt) ? "#2D8A5E12" : "#fff", color: formReward === String(amt) ? "#2D8A5E" : "#5A7184", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>NT$ {amt.toLocaleString()}</button>
              ))}
            </div>
            {formReward && parseInt(formReward) > 3000 && <div style={{ marginTop: 6, padding: "8px 12px", background: "#FFF3E0", borderRadius: 8, border: "1px solid #FFB74D", fontSize: 12, color: "#E65100" }}>⚠️ 高額感謝金提醒：請確保您有支付意願，未兌現可能影響信用分數。</div>}
            {formReward && parseInt(formReward) > 0 && parseInt(formReward) <= 3000 && <p style={{ fontSize: 12, color: "#2D8A5E", margin: "6px 0 0" }}>💰 尋獲者可獲得 NT$ {parseInt(formReward).toLocaleString()} 感謝金</p>}
            <p style={{ fontSize: 11, color: "#B0BEC5", margin: "4px 0 0" }}>上限 NT$10,000</p>
          </>)}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><label style={{ ...S.label, fontSize: 12 }}>{t.date} *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} /></div>
            <div style={{ flex: 1 }}><label style={{ ...S.label, fontSize: 12 }}>⏰ 時間</label><input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} style={{ ...S.input, fontSize: 13, padding: "8px 10px" }} /></div>
          </div>

          {/* Photo upload */}
          <label style={S.label}>📷 照片（最多3張，15天後自動移除）</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {formPhotos.map((src, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                <img src={src} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
                <button onClick={() => setFormPhotos(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "#E05A33", color: "#fff", border: "none", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
              </div>
            ))}
            {formPhotos.length < 3 && (
              <button onClick={() => photoInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 12, border: "2.5px dashed #C8D3DE", background: "#F7F9FC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" }}>
                <span style={{ fontSize: 24 }}>📷</span>
                <span style={{ fontSize: 11, color: "#8896A6" }}>上傳</span>
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoUpload} />

          <label style={S.label}>{ t.title } *</label><input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={t.titlePlaceholder} style={S.input} />
          <label style={S.label}>{ t.description } *</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder={t.descPlaceholder} style={S.textarea} rows={3} />

          <div style={S.verifySection}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 18 }}>🛡️</span><label style={{ ...S.label, margin: 0, color: "#E05A33" }}>防冒領驗證題 *</label></div>
            <p style={{ fontSize: 12, color: "#5A7184", margin: "0 0 12px" }}>設定只有真正失主才能回答的問題。</p>
            {formVerifyQs.map((vq, i) => (
              <div key={i} style={S.verifyQCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: "#1B4965" }}>驗證題 {i + 1}</span>{formVerifyQs.length > 1 && <button onClick={() => removeVerifyQ(i)} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>移除</button>}</div>
                {!vq.custom && !vq.q ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{(verifyHints[formCat] || verifyHints._default || []).map(h => <button type="button" key={h} onClick={() => selectHintQ(i, h)} style={S.hintChip}>{h}</button>)}<button type="button" onClick={() => selectHintQ(i, "自訂問題⋯")} style={S.hintChip}>✏️ 自訂問題</button></div>
                ) : <input value={vq.q} onChange={e => updateVerifyQ(i, "q", e.target.value)} placeholder="輸入自訂驗證問題⋯" style={{ ...S.input, marginBottom: 8 }} readOnly={!vq.custom} />}
                {(vq.q || vq.custom) && <input value={vq.a} onChange={e => updateVerifyQ(i, "a", e.target.value)} placeholder={t.answerPlaceholder} style={S.input} />}
                {vq.q && !vq.custom && <button onClick={() => { updateVerifyQ(i, "q", ""); updateVerifyQ(i, "custom", false); }} style={{ background: "none", border: "none", color: "#8896A6", cursor: "pointer", fontSize: 12, marginTop: 4 }}>← 重新選擇</button>}
              </div>
            ))}
            {formVerifyQs.length < 3 && <button onClick={addVerifyQ} style={S.addQBtn}>＋ 新增驗證題</button>}
          </div>

          <label style={S.label}>{ t.contact } *</label><p style={{ fontSize: 12, color: "#8896A6", margin: "-4px 0 8px" }}>{t.contactVisible}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={formContactType} onChange={e => setFormContactType(e.target.value)} style={{ ...S.select, width: 120, flexShrink: 0 }}>
              <option value="line">LINE</option>
              <option value="email">Email</option>
              <option value="phone">電話</option>
            </select>
            <input value={formContact} onChange={e => setFormContact(e.target.value)} placeholder={formContactType === "line" ? "LINE ID" : formContactType === "email" ? "email@example.com" : "0912-345-678"} style={{ ...S.input, flex: 1 }} />
          </div>
          {/* Honeypot - hidden from users, catches bots */}
          <div style={{ position: "absolute", left: -9999, opacity: 0, height: 0, overflow: "hidden" }}>
            <input value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          {!editingPost && referralCount > 0 && (
            <div onClick={() => setUsePin(!usePin)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: usePin ? "#D4880F14" : "#F7F9FC", borderRadius: 12, marginBottom: 12, cursor: "pointer", border: usePin ? "2px solid #D4880F" : "2px solid transparent" }}>
              <span style={{ fontSize: 22 }}>{usePin ? "📌" : "☐"}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: usePin ? "#D4880F" : "#5A7184" }}>使用免費置頂</div>
                <div style={{ fontSize: 11, color: "#8896A6" }}>剩餘 {referralCount} 次（推薦獎勵）</div>
              </div>
            </div>
          )}

          {/* Safety notices */}
          {appMode === "item" && (
          <div style={{ background: "#FFF8E1", borderRadius: 10, padding: 12, marginBottom: 12, border: "1px solid #FFE082" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E65100", marginBottom: 6 }}>📢 溫馨提醒</div>
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 1.8 }}>
              <div>• 拾獲物品請同時向警方報案（民法第 803 條）</div>
              <div>• 本平台為互助媒合性質，不取代法定報案程序</div>
            </div>
          </div>
          )}
          {appMode === "pet" && (
          <div style={{ background: "#F3E5F5", borderRadius: 10, padding: 12, marginBottom: 12, border: "1px solid #CE93D8" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6A1B9A", marginBottom: 6 }}>🐾 寵物協尋提醒</div>
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 1.8 }}>
              <div>• 拾獲走失寵物請通報當地動物保護處或送交收容所（動保法第 14 條）</div>
              <div>• 飼主應為寵物植入晶片並辦理登記（動保法第 19 條）</div>
              <div>• 可撥打各縣市 1999 或動保處專線通報</div>
              <div>• 本平台為互助媒合性質，不取代法定通報程序</div>
            </div>
          </div>
          )}
          <div style={{ background: "#FFEBEE", borderRadius: 12, padding: 14, marginBottom: 12, border: "1px solid #FFCDD2" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C62828", marginBottom: 8 }}>🛡️ 防詐安全提醒</div>
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 2 }}>
              <div>🚫 <strong>不轉帳</strong>：見面前不要匯款、轉帳或支付任何費用</div>
              <div>🚫 <strong>不點連結</strong>：不點擊不明網址，避免個資外洩</div>
              <div>🚫 <strong>不給個資</strong>：不提供身分證、銀行帳號、密碼、OTP 驗證碼</div>
              <div>✅ <strong>面交為主</strong>：盡量選擇公共場所面對面交接</div>
              <div>✅ <strong>善用驗證</strong>：設定好驗證問題，確認對方是真正失主</div>
              <div>✅ <strong>留存紀錄</strong>：使用平台交接紀錄單，雙方簽名保障權益</div>
            </div>
            <div style={{ marginTop: 8, padding: "6px 10px", background: "#fff", borderRadius: 8, fontSize: 11, color: "#C62828", fontWeight: 600 }}>📞 遇到可疑情況請撥打 165 反詐騙專線</div>
          </div>

          {editingPost ? (
            <button onClick={handleUpdate} style={{ ...S.submitBtn, opacity: (formCat && (formAirport || formLocationText.trim() || formLocation) && formTitle && formDesc) ? 1 : 0.5 }}>✏️ 儲存修改</button>
          ) : (
            <button onClick={handleSubmit} style={{ ...S.submitBtn, opacity: (formCat && (formAirport || formLocationText.trim() || formLocation) && formTitle && formDesc && formContact && validQCount > 0) ? 1 : 0.5 }}>📤 發佈留言</button>
          )}

          {/* Map Search Modal */}
          {showMapModal && (
            <div style={S.modalOverlay}>
              <div style={{ ...S.modalCard, maxWidth: 500, maxHeight: "90vh", overflow: "hidden", padding: "16px 16px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>🗺️ 選擇地點</h3>
                  <button onClick={() => setShowMapModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input value={mapSearchQuery} onChange={e => setMapSearchQuery(e.target.value)} placeholder="搜尋地址或地點⋯" style={{ ...S.input, flex: 1, fontSize: 14 }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchLocation(mapSearchQuery); } }} />
                  <button onClick={() => searchLocation(mapSearchQuery)} type="button" style={{ ...S.sendBtn, whiteSpace: "nowrap" }}>{searchingLocation ? "⋯" : "🔍"}</button>
                </div>
                {/* Interactive Leaflet Map */}
                <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 10, height: 320 }}>
                  <iframe title="mapPicker" width="100%" height="320" frameBorder="0" style={{ border: 0 }}
                    srcDoc={'<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0}#map{width:100%;height:100vh}</style></head><body><div id="map"></div><script>var lat=' + (formLocation?.lat || 25.033) + ',lng=' + (formLocation?.lng || 121.565) + ';var map=L.map("map").setView([lat,lng],' + (formLocation ? 16 : 13) + ');L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OSM"}).addTo(map);var marker=L.marker([lat,lng],{draggable:true}).addTo(map);marker.on("dragend",function(){var p=marker.getLatLng();parent.postMessage({type:"mapPin",lat:p.lat,lng:p.lng},"*")});map.on("click",function(e){marker.setLatLng(e.latlng);parent.postMessage({type:"mapPin",lat:e.latlng.lat,lng:e.latlng.lng},"*")})<\/script></body></html>'} />
                </div>
                <div style={{ fontSize: 12, color: "#8896A6", textAlign: "center", marginBottom: 8 }}>點擊地圖或拖曳紅色標點選擇位置</div>
                {locationResults.length > 0 && (
                  <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 10, borderRadius: 10, border: "1px solid #E8EDF2" }}>
                    {locationResults.map((r, i) => (
                      <div key={i} onClick={() => {
                        setFormLocation({ lat: r.lat, lng: r.lng });
                        if (!formLocationText) setFormLocationText(r.name.split(",")[0]);
                        setLocationResults([]);
                      }} style={{ padding: "10px 14px", background: i % 2 === 0 ? "#F7F9FC" : "#fff", cursor: "pointer", fontSize: 13, color: "#2C3E50", lineHeight: 1.4, borderBottom: "1px solid #F7F9FC" }}>
                        📍 {r.name}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    navigator.geolocation?.getCurrentPosition(
                      (pos) => { setFormLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
                      () => alert("無法取得位置")
                    );
                  }} type="button" style={{ ...S.modalPrimaryBtn, flex: 1, background: "linear-gradient(135deg, #2D8A5E, #28A06E)", marginBottom: 0 }}>📍 目前位置</button>
                  {formLocation && <button onClick={() => setShowMapModal(false)} type="button" style={{ ...S.modalPrimaryBtn, flex: 1, marginBottom: 0 }}>✅ 確認地點</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ FEED ═══
  return (
    <div style={{ ...S.root, maxWidth: desktopWide ? "100%" : 720 }} onTouchStart={handlePullStart} onTouchMove={handlePullMove} onTouchEnd={handlePullEnd}>
      {pullIndicator > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", paddingTop: Math.min(pullIndicator * 0.5, 40), transition: "padding 0.1s" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transform: "rotate(" + (pullIndicator * 3) + "deg)" }}>{pullIndicator > 80 ? "🔄" : "↓"}</div>
        </div>
      )}
      <header style={{ ...S.header, flexDirection: "column", gap: 2, paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, cursor: "pointer", position: "relative", zIndex: 5 }} onClick={() => { setTutorialStep(-1); setShowTutorial(true); }}>
            <img src="/header-icon.png" alt="" style={{ height: 70, width: 70, borderRadius: 12 }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>what<span style={{ position: "relative", display: "inline-block", width: 0 }}><span style={{ position: "absolute", bottom: "100%", marginBottom: 2, left: -2, width: 5, height: 8, background: "#4ADE80", borderRadius: 2 }}></span></span>sfind</div>
              <span style={{ fontSize: 11, color: "#A8D0E6", letterSpacing: 0.5 }}>{t.subtitle}</span>
            </div>
          </div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Notification Bell */}
              <div style={{ position: "relative" }}>
                <button onClick={() => {
                  setShowNotifPanel(!showNotifPanel);
                  setReadNotifCount(notifications.length);
                  // Mark all as read in Firestore
                  if (!showNotifPanel && notifications.length > 0) {
                    notifications.forEach(n => {
                      updateDoc(doc(db, "userNotifs", n.id), { read: true }).catch(() => {});
                    });
                  }
                }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}>🔔</button>
                {unreadCount > 0 && <span style={S.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowMenu(!showMenu)} style={S.avatarBtn}><AvatarCircle name={user.name} avatar={user.avatar} size={32} /></button>
                {showMenu && (<div style={S.dropdownMenu}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF2F7" }}>
                    <div style={{ fontWeight: 700, color: "#1B4965", fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "#8896A6" }}>{user.email}</div>
                    <div onClick={() => { navigator.clipboard.writeText(user.uid); alert("UID 已複製：" + user.uid); }} style={{ fontSize: 10, color: "#B0BEC5", marginTop: 4, cursor: "pointer", wordBreak: "break-all" }}>UID: {user.uid} 📋</div>
                  </div>
                  {notifPermission !== "granted" && <button onClick={() => { requestNotifPermission(); setShowMenu(false); }} style={{ ...S.menuItem, color: "#1B4965" }}>🔔 開啟通知</button>}
                  {notifPermission === "granted" && <div style={{ padding: "8px 16px", fontSize: 12, color: "#2D8A5E" }}>🔔 通知已開啟</div>}
                  <div style={{ padding: "8px 16px", borderTop: "1px solid #EEF2F7", display: "flex", gap: 4 }}>
                    {[["zh","中"],["en","EN"],["ja","日"],["ko","한"]].map(([l,label]) => (
                      <button key={l} onClick={() => { switchLang(l); setShowMenu(false); }} style={{ flex: 1, padding: "6px", borderRadius: 6, border: lang === l ? "2px solid #1B4965" : "1px solid #DDE4EC", background: lang === l ? "#1B496510" : "#fff", color: lang === l ? "#1B4965" : "#8896A6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{label}</button>
                    ))}
                  </div>
                  {isAdmin && <button onClick={() => { openCatEditor(); setShowMenu(false); }} style={{ ...S.menuItem, color: "#1B4965" }}>⚙️ 管理類別</button>}
                  {isAdmin && <button onClick={async () => {
                    setShowDashboard(true); setShowMenu(false);
                    getDocs(collection(db, "referrals")).then(snap => setTotalUsers(snap.size)).catch(() => {});
                    const snap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
                    setReportsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                  }} style={{ ...S.menuItem, color: "#1B4965" }}>📊 管理儀表板</button>}
                  {isRealAdmin && <button onClick={() => { setAdminMode(!adminMode); setShowMenu(false); }} style={{ ...S.menuItem, color: adminMode ? "#2D8A5E" : "#D4880F" }}>{adminMode ? "👤 切換一般瀏覽" : "👑 切換管理模式"}</button>}
                  {window.innerWidth >= 768 && <button onClick={() => { setDesktopWide(!desktopWide); setShowMenu(false); }} style={{ ...S.menuItem, color: "#5A7184" }}>{desktopWide ? "📱 標準寬度" : "🖥️ 全螢幕寬度"}</button>}
                  <button onClick={() => { setShowTutorialVideo(true); setShowMenu(false); }} style={{ ...S.menuItem, color: "#2D8A5E" }}>📖 使用教學</button>
                  <button onClick={() => { setView("profile"); setShowMenu(false); }} style={{ ...S.menuItem, color: "#1B4965" }}>👤 個人頁面</button>
                  <button onClick={handleLogout} style={S.menuItem}>🚪 {t.logout}</button>
                </div>)}
              </div>
            </div>
          ) : <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>{[["zh","中"],["en","EN"],["ja","日"],["ko","한"]].map(([l,label]) => <button key={l} onClick={() => switchLang(l)} style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: lang === l ? "rgba(255,255,255,0.3)" : "transparent", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>)}</div>
              <button onClick={() => setView("login")} style={S.loginHeaderBtn}>{t.login}</button>
            </div>}
        </div>
      </header>

      {/* Notification permission banner */}
      {user && notifPermission !== "granted" && (
        <div style={S.notifBanner}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1B4965" }}>🔔 {notifSupported ? "開啟通知" : "加入主畫面"}</div>
            <div style={{ fontSize: 12, color: "#5A7184" }}>{notifSupported ? "有人認領或回覆時即時提醒您" : "加入主畫面後即可收到即時通知"}</div>
          </div>
          <button onClick={requestNotifPermission} style={S.notifBannerBtn}>{notifSupported ? "開啟" : "了解"}</button>
        </div>
      )}

      {/* Announcements - marquee style */}
      {announcements.length > 0 && feedMode === "list" && (() => {
        const allLines = announcements.flatMap(a => (a.text || "").split("\n").filter(l => l.trim()));
        return allLines.length > 0 && (
          <div onClick={() => setAnnExpanded(!annExpanded)} style={{ margin: "10px 16px 0", background: "#EBF5FB", borderRadius: 10, border: "1px solid #C8DDF0", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>📢</span>
              {!annExpanded ? (
                <div style={{ flex: 1, overflow: "hidden", height: 20 }}>
                  <div style={{ animation: "marqueeScroll " + (allLines.length * 3) + "s linear infinite", display: "flex", flexDirection: "column" }}>
                    {[...allLines, ...allLines].map((line, i) => (
                      <div key={i} style={{ height: 20, lineHeight: "20px", fontSize: 13, fontWeight: 600, color: "#1B4965", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: "#1B4965" }}>{allLines[0]}</span>
              )}
              <span style={{ fontSize: 12, color: "#8896A6", flexShrink: 0, transition: "transform 0.2s", transform: annExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </div>
            {annExpanded && (
              <div style={{ padding: "0 14px 10px" }}>
                {allLines.slice(1).map((line, i) => (
                  <p key={i} style={{ margin: "2px 0", fontSize: 13, color: "#2C3E50", lineHeight: 1.6 }}>{line}</p>
                ))}
                {announcements[0]?.createdAt && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#8896A6" }}>{announcements[0].createdAt.toDate?.()?.toLocaleDateString("zh-TW") || ""}</p>}
              </div>
            )}
          </div>
        );
      })()}


      {/* Map View */}
      {feedMode === "map" && (
        <>
        <div style={{ display: "flex", margin: "4px 16px 4px", gap: 8 }}>
          <div onClick={() => { setAppMode("item"); setFilter("all"); setCatGroup("all"); }} style={{ flex: 1, cursor: "pointer", borderRadius: 999, overflow: "hidden", opacity: appMode === "item" ? 1 : 0.5, transition: "all 0.2s" }}>
            <img src="/btn-item.png" alt="尋物" style={{ width: "100%", display: "block" }} />
          </div>
          <div onClick={() => { setAppMode("pet"); setFilter("all"); setCatGroup("all"); }} style={{ flex: 1, cursor: "pointer", borderRadius: 999, overflow: "hidden", opacity: appMode === "pet" ? 1 : 0.5, transition: "all 0.2s" }}>
            <img src="/btn-pet.png" alt="尋寵" style={{ width: "100%", display: "block" }} />
          </div>
        </div>
        {appMode === "pet" && (
          <div style={{ margin: "0 16px 8px", display: "flex", gap: 6 }}>
            <button onClick={() => {
              if (!showLostPetsOnMap) {
                setShowLostPetsOnMap(true);
              } else {
                setShowLostPetsOnMap(false);
                setMapLostPets([]);
                try { localStorage.removeItem("wf_lostpet_cache_v3"); } catch {}
              }
            }} disabled={mapLostPetsLoading} style={{ flex: 1, padding: "8px", borderRadius: 10, border: showLostPetsOnMap ? "none" : "1.5px solid #E05A33", background: showLostPetsOnMap ? "linear-gradient(135deg, #E05A33, #C62828)" : "#fff", color: showLostPetsOnMap ? "#fff" : "#E05A33", fontSize: 12, fontWeight: 700, cursor: mapLostPetsLoading ? "wait" : "pointer", opacity: mapLostPetsLoading ? 0.7 : 1 }}>
              {mapLostPetsLoading ? "⏳ 載入中..." : "🔍 " + (showLostPetsOnMap ? "隱藏" : "顯示") + "走失寵物通報" + (mapLostPets.length > 0 ? "（" + mapLostPets.length + "）" : "")}
            </button>
            <button onClick={() => {
              if (!showShelterOnMap) {
                setShowShelterOnMap(true);
              } else {
                setShowShelterOnMap(false);
                setMapShelterAnimals([]);
                try { localStorage.removeItem("wf_shelter_cache_v7"); } catch {}
              }
            }} disabled={mapShelterLoading} style={{ flex: 1, padding: "8px", borderRadius: 10, border: showShelterOnMap ? "none" : "1.5px solid #7B4BB2", background: showShelterOnMap ? "linear-gradient(135deg, #7B4BB2, #9C27B0)" : "#fff", color: showShelterOnMap ? "#fff" : "#7B4BB2", fontSize: 12, fontWeight: 700, cursor: mapShelterLoading ? "wait" : "pointer", opacity: mapShelterLoading ? 0.7 : 1 }}>
              {mapShelterLoading ? "⏳ 載入中..." : "🏠 " + (showShelterOnMap ? "隱藏" : "顯示") + "已被撿到" + (mapShelterAnimals.length > 0 ? "（" + mapShelterAnimals.length + "）" : "")}
            </button>
          </div>
        )}
        <div style={{ margin: "0 16px 4px", borderRadius: 18, overflow: "hidden", height: 420, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", position: "relative" }}>
          {(mapShelterLoading || mapLostPetsLoading) && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={S.spinner} />
                <div style={{ fontSize: 13, color: "#5A7184", marginTop: 10 }}>載入政府資料中...</div>
              </div>
            </div>
          )}
          <button onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  const sorted = [...AIRPORTS_DATA]
                    .map(a => ({ ...a, dist: getDistance(pos.coords.latitude, pos.coords.longitude, a.lat, a.lng) }))
                    .sort((a, b) => a.dist - b.dist);
                  setSortedAirports(sorted.map(a => a.name));
                },
                () => alert("無法取得位置，請確認已開啟定位權限")
              );
            }
          }} style={{ position: "absolute", bottom: 16, right: 16, zIndex: 400, width: 40, height: 40, borderRadius: 8, background: "#fff", border: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#4285F4"/>
              <circle cx="12" cy="12" r="8" stroke="#4285F4" strokeWidth="2" fill="none"/>
              <line x1="12" y1="0" x2="12" y2="4" stroke="#666" strokeWidth="2"/>
              <line x1="12" y1="20" x2="12" y2="24" stroke="#666" strokeWidth="2"/>
              <line x1="0" y1="12" x2="4" y2="12" stroke="#666" strokeWidth="2"/>
              <line x1="20" y1="12" x2="24" y2="12" stroke="#666" strokeWidth="2"/>
            </svg>
          </button>
          <iframe title="allmap" width="100%" height="420" frameBorder="0" style={{ border: 0 }}
            srcDoc={'<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0}#map{width:100%;height:100vh}.cat-icon{display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:18px;width:36px;height:36px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)}</style></head><body><div id="map"></div><script>' +
              'var map=L.map("map").setView([' + (userLocation?.lat || 25.033) + ',' + (userLocation?.lng || 121.565) + '],12);' +
              'L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OSM"}).addTo(map);' +
              (userLocation ? 'L.circleMarker([' + userLocation.lat + ',' + userLocation.lng + '],{radius:8,fillColor:"#2196F3",color:"#fff",weight:3,opacity:1,fillOpacity:1}).addTo(map).bindPopup("📍 你的位置");L.circle([' + userLocation.lat + ',' + userLocation.lng + '],{radius:500,color:"#2196F3",fillColor:"#2196F3",fillOpacity:0.1,weight:1}).addTo(map);' : '') +
              filtered.filter(p => !p.resolved).map(p => {
                const cat = catInfo(p.category);
                let lat = p.location?.lat;
                let lng = p.location?.lng;
                // Fallback: use airport coordinates
                if (!lat && p.airport) {
                  const apt = AIRPORTS_DATA.find(a => a.name === p.airport || p.airport.includes(a.code));
                  if (apt) { lat = apt.lat; lng = apt.lng; }
                }
                if (!lat) return '';
                var pPhoto = (p.photos && p.photos.length > 0 && !isPhotoExpired(p.photosUploadedAt)) ? '<img src="' + p.photos[0] + '" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:6px"/>' : '';
                var pType = p.postType === "lost" ? "😰 遺失" : p.postType === "found" ? "🔍 拾獲" : "";
                var pDesc = (p.desc || "").replace(/\n/g, " ").replace(/'/g, "").substring(0, 50);
                var pPopup = pPhoto +
                  '<div style="font-weight:800;font-size:14px;color:#1B4965;margin-bottom:4px">' + (p.title||'').replace(/'/g,"") + '</div>' +
                  '<div style="font-size:11px;color:' + cat.color + ';font-weight:700;margin-bottom:4px">' + catLabel(cat) + (pType ? " · " + pType : "") + '</div>' +
                  '<div style="font-size:12px;color:#5A7184;line-height:1.7">' +
                  (pDesc ? '📝 ' + pDesc + '...<br>' : '') +
                  '📍 ' + (p.locationText||p.airport||'—').replace(/'/g,"") + '<br>' +
                  '📅 ' + (p.date || '—') +
                  (p.reward > 0 ? '<br><b style="color:#2D8A5E">💰 感謝金 NT$' + p.reward + '</b>' : '') +
                  '</div>' +
                  '<div style="margin-top:8px;padding:6px;background:#1B4965;color:#fff;border-radius:6px;text-align:center;font-weight:700;font-size:12px;cursor:pointer">👉 點此查看詳情</div>';
                return 'L.marker([' + lat + ',' + lng + '],{icon:L.divIcon({className:"",html:\'<img src="https://whatsfind-app.vercel.app' + (cat.img || '') + '" width="40" height="40" style="object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>\',iconSize:[40,40],iconAnchor:[20,20]})}).addTo(map).bindPopup(\'' + pPopup + '\',{maxWidth:220,minWidth:200}).on("popupopen",function(){var el=document.querySelector(".leaflet-popup-content div:last-child");if(el)el.onclick=function(){parent.postMessage({type:"openPost",postId:"' + p.id + '"},"*")}});';
              }).join('') +
              (showShelterOnMap && appMode === "pet" ? (function() {
                var groups = {};
                mapShelterAnimals.forEach(function(a) {
                  var coord = findShelterCoord(a.shelter_name, a.shelter_address, a.animal_place);
                  if (!coord) return;
                  var key = a.shelter_name || (coord.lat + "," + coord.lng);
                  if (!groups[key]) groups[key] = { coord: coord, animals: [], name: a.shelter_name || "收容所", tel: a.shelter_tel, addr: a.shelter_address };
                  groups[key].animals.push(a);
                });
                var dist = function(c2) { return userLocation ? getDistance(userLocation.lat, userLocation.lng, c2.lat, c2.lng) : 9999; };
                return Object.keys(groups).map(function(k) { var g = groups[k]; g._dist = dist(g.coord); g._key = k; return g; })
                  .sort(function(x, y) { return x._dist - y._dist; }).slice(0, 60);
              })().map(function(g) {
                var esc = function(s) { return String(s || "").replace(/[\\'"\n\r\t<>]/g, " ").substring(0, 40); };
                var count = g.animals.length;
                var markerHtml = '<div style="position:relative;width:48px;height:48px"><div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#fff,#F3E5F5);border:2.5px solid #7B4BB2;box-shadow:0 3px 10px rgba(123,75,178,0.4);display:flex;align-items:center;justify-content:center;font-size:24px">🏠</div><div style="position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#E05A33;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)">' + count + '</div></div>';
                return 'L.marker([' + g.coord.lat + ',' + g.coord.lng + '],{icon:L.divIcon({className:"",html:\'' + markerHtml + '\',iconSize:[48,48],iconAnchor:[24,24]})}).addTo(map).on("click",function(){parent.postMessage({type:"openShelter",key:"' + esc(g._key) + '"},"*")});';
              }).join('') : '') +
              (showLostPetsOnMap && appMode === "pet" ? (function() {
                var groups = {};
                mapLostPets.forEach(function(a) {
                  var coord = null;
                  var lp = a.lostPlace || "";
                  for (var d in DISTRICT_COORDS) { if (lp.indexOf(d) >= 0) { coord = DISTRICT_COORDS[d]; break; } }
                  if (!coord) { for (var k in SHELTER_COORDS) { if (lp.indexOf(k.replace("市","").replace("縣","")) >= 0) { coord = SHELTER_COORDS[k]; break; } } }
                  if (!coord) return;
                  var key = coord.lat + "," + coord.lng;
                  if (!groups[key]) groups[key] = { coord: coord, pets: [], place: lp };
                  groups[key].pets.push(a);
                });
                var dist = function(c2) { return userLocation ? getDistance(userLocation.lat, userLocation.lng, c2.lat, c2.lng) : 9999; };
                return Object.keys(groups).map(function(k) { var g = groups[k]; g._dist = dist(g.coord); return g; })
                  .sort(function(x, y) { return x._dist - y._dist; }).slice(0, 60);
              })().map(function(g) {
                var esc = function(s) { return String(s || "").replace(/[\\'"\n\r\t<>]/g, " ").substring(0, 50); };
                var count = g.pets.length;
                var isNear = g._dist <= 10;
                var listHtml = g.pets.slice(0, 6).map(function(a) {
                  var em = a.petKind === "貓" ? "🐈" : "🐕";
                  var img = (isNear && a.photo) ? '<img src="' + proxyImg(a.photo) + '" style="width:100%;height:52px;object-fit:cover;border-radius:4px"/>' : '<div style="height:52px;display:flex;align-items:center;justify-content:center;font-size:24px;background:#FFF3E0;border-radius:4px">' + em + '</div>';
                  return '<div style="width:31%">' + img + '<div style="font-size:9px;color:#5A7184;text-align:center;margin-top:2px">' + esc(a.petName || a.breed) + '</div></div>';
                }).join("");
                var firstPlace = esc(g.pets[0].lostPlace);
                var popupText =
                  '<div style="font-weight:800;font-size:14px;color:#E05A33;margin-bottom:4px">🔍 走失通報 ' + count + ' 筆</div>' +
                  '<div style="font-size:11px;color:#8896A6;margin-bottom:6px">📍 ' + firstPlace + '</div>' +
                  '<div style="display:flex;flex-wrap:wrap;gap:3%;margin-bottom:6px">' + listHtml + '</div>' +
                  (count > 6 ? '<div style="font-size:10px;color:#8896A6;text-align:center">…還有 ' + (count - 6) + ' 筆</div>' : '') +
                  (g.pets[0].phone ? '<a href="tel:' + g.pets[0].phone + '" style="display:block;margin-top:6px;padding:6px;background:#E05A33;color:#fff;border-radius:6px;text-align:center;text-decoration:none;font-weight:700;font-size:12px">📞 聯絡飼主</a>' : '');
                var size = count > 20 ? 52 : count > 5 ? 44 : 38;
                var markerHtml = '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:linear-gradient(135deg,#E05A33,#C62828);border:3px solid #fff;box-shadow:0 3px 10px rgba(224,90,51,0.5);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff"><div style="font-size:' + (size > 44 ? 15 : 13) + 'px;font-weight:800;line-height:1">' + count + '</div><div style="font-size:9px;line-height:1">🔍</div></div>';
                return 'L.marker([' + g.coord.lat + ',' + g.coord.lng + '],{icon:L.divIcon({className:"",html:\'' + markerHtml + '\',iconSize:[' + size + ',' + size + '],iconAnchor:[' + (size/2) + ',' + (size/2) + ']})}).addTo(map).bindPopup(\'' + popupText + '\',{maxWidth:250,minWidth:220});';
              }).join('') : '') +
            '<\/script></body></html>'} />
        </div>
        </>
      )}
      {feedMode === "map" && !showShelterOnMap && !showLostPetsOnMap && filtered.filter(p => (p.location || p.locationText) && !p.resolved).length > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📍 有地點標記的貼文 ({filtered.filter(p => (p.location || p.locationText) && !p.resolved).length})</div>
          {filtered.filter(p => (p.location || p.locationText) && !p.resolved).map(p => {
            const cat = catInfo(p.category);
            return (
              <div key={p.id} onClick={() => { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }} style={{ ...S.postCard, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat.img ? <img src={cat.img} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 20 }}>{cat.icon}</span>}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2B3C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#5A7184" }}>📍 {p.locationText || p.airport}</div>
                </div>
                {p.reward > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#2D8A5E", background: "#2D8A5E14", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>💰 NT${p.reward}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {feedMode === "list" && <>

      {/* Search bar */}
      {readOnlyMode && (
        <div style={{ margin: "4px 16px", padding: "8px 12px", background: "#FFF3E0", borderRadius: 10, border: "1.5px solid #FFB74D", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ color: "#E65100", fontWeight: 600, flex: 1 }}>系統流量較大，目前為唯讀模式，暫時無法發文</span>
          <button onClick={() => { firestoreErrorRef.current = 0; setFirestoreErrors(0); setReadOnlyMode(false); }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#E65100", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>重試</button>
        </div>
      )}
      <div style={{ margin: "4px 16px", position: "relative" }}>
        <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="🔍 你正在找什麼？例如：黑色錢包、iPhone、行李箱..." style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #DDE4EC", background: "#fff", fontSize: 13, color: "#1B4965", outline: "none" }} />
      </div>

      {/* Hero cards - image buttons */}
      <div style={{ display: "flex", margin: "0 16px 0", gap: 10 }}>
        <div onClick={() => { setAppMode("item"); setFilter("all"); setCatGroup("all"); }} style={{ flex: 1, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: appMode === "item" ? "3px solid #1B4965" : "2px solid transparent", boxShadow: appMode === "item" ? "0 4px 16px rgba(27,73,101,0.25)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.2s", opacity: appMode === "item" ? 1 : 0.75 }}>
          <img src={lang === "zh" ? "/mode-item.png" : "/mode-item-en.png"} alt="Lost Items" style={{ width: "100%", display: "block" }} />
        </div>
        <div onClick={() => { setAppMode("pet"); setFilter("all"); setCatGroup("all"); }} style={{ flex: 1, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: appMode === "pet" ? "3px solid #2D8A5E" : "2px solid transparent", boxShadow: appMode === "pet" ? "0 4px 16px rgba(45,138,94,0.25)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.2s", opacity: appMode === "pet" ? 1 : 0.75 }}>
          <img src={lang === "zh" ? "/mode-pet.png" : "/mode-pet-en.png"} alt="Lost Pets" style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* Publish banner */}
      <div style={{ margin: "-4px 16px -4px", position: "relative", cursor: "pointer" }}>
        <img src={lang === "zh" ? "/publish-banner.png" : "/publish-banner-en.png"} alt="I Want to Post" style={{ width: "100%", borderRadius: 14, display: "block" }} />
        {/* Clickable areas over the buttons */}
        <div onClick={() => { setAppMode("item"); setView("post"); }} style={{ position: "absolute", right: "22%", top: "15%", width: "20%", height: "70%", cursor: "pointer" }} />
        <div onClick={() => { setAppMode("pet"); setView("post"); }} style={{ position: "absolute", right: "1%", top: "15%", width: "20%", height: "70%", cursor: "pointer" }} />
      </div>

      {/* Nearby posts - sorted by distance */}
      {(() => {
        // Auto-request location
        if (!userLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              const sorted = [...AIRPORTS_DATA]
                .map(a => ({ ...a, dist: getDistance(pos.coords.latitude, pos.coords.longitude, a.lat, a.lng) }))
                .sort((a, b) => a.dist - b.dist);
              setSortedAirports(sorted.map(a => a.name));
            }, () => {});
        }
        const activePosts = posts.filter(p => {
          if (appMode === "item" && PET_CATS.includes(p.category)) return false;
          if (appMode === "pet" && !PET_CATS.includes(p.category)) return false;
          return !p.resolved && !p.hidden;
        });
        let nearbyPosts = activePosts;
        let nearbyRadius = null;
        if (userLocation) {
          nearbyPosts = activePosts.map(p => {
            let lat = p.location?.lat;
            let lng = p.location?.lng;
            if (!lat && p.airport) {
              const apt = AIRPORTS_DATA.find(a => a.name === p.airport || (p.airport && p.airport.includes(a.code)));
              if (apt) { lat = apt.lat; lng = apt.lng; }
            }
            const dist = lat ? getDistance(userLocation.lat, userLocation.lng, lat, lng) : 99999;
            return { ...p, _dist: dist };
          }).sort((a, b) => a._dist - b._dist);
          const closest = nearbyPosts.filter(p => p._dist < 50);
          nearbyRadius = closest.length > 0 ? Math.ceil(closest[closest.length - 1]._dist) : null;
        }
        if (nearbyPosts.length === 0) return null;
        return (
        <div style={{ margin: "0 16px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1B4965" }}>
              {userLocation ? ("📍 " + (nearbyRadius ? t.nearbyKm.replace("{km}", nearbyRadius) : t.statSearching)) : "📍 " + (appMode === "pet" ? t.nearbyPet : t.nearbyLatest)}
            </span>
            <span onClick={() => { const el = document.getElementById("catTabs"); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: y, behavior: "smooth" }); } }} style={{ fontSize: 12, color: "#2D8A5E", fontWeight: 700, cursor: "pointer" }}>{t.seeMore}</span>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {nearbyPosts.slice(0, 6).map(p => {
              const cat = catInfo(p.category);
              return (
                <div key={p.id} onClick={() => { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }} style={{ minWidth: 160, maxWidth: 180, background: "#fff", borderRadius: 14, padding: 12, border: "1.5px solid #EEF2F7", cursor: "pointer", scrollSnapAlign: "start", flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: cat.color + "15", color: cat.color, fontWeight: 700 }}>{PET_CATS.includes(p.category) ? "走失寵物" : "遺失物"}</span>
                    {userLocation && p._dist < 99999 && <span style={{ fontSize: 9, color: "#8896A6" }}>{p._dist < 1 ? (p._dist * 1000).toFixed(0) + "m" : p._dist.toFixed(1) + "km"}</span>}
                  </div>
                  {p.photos?.length > 0 && !isPhotoExpired(p.photosUploadedAt) ? (
                    <div style={{ position: "relative", width: "100%", height: 80, borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
                      <img src={p.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onContextMenu={e => e.preventDefault()} />
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 80, borderRadius: 10, background: "linear-gradient(135deg, " + cat.color + "15, " + cat.color + "08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 6, border: "1.5px dashed " + cat.color + "30" }}>
                      {cat.img ? <img src={cat.img} alt="" style={{ width: 48, height: 48, objectFit: "contain" }} /> : <div style={{ fontSize: 24 }}>{cat.icon}</div>}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B3C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>📍 {p.locationText || p.airport || "—"}</div>
                  <div style={{ fontSize: 10, color: "#8896A6", marginTop: 2 }}>{p.date}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "#2D8A5E", fontWeight: 700 }}>{PET_CATS.includes(p.category) ? "查看協尋 →" : "查看詳情 →"}</div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}

      {/* Stats bar - after nearby posts */}
      {(() => {
        const modePosts = posts.filter(p => appMode === "pet" ? PET_CATS.includes(p.category) : !PET_CATS.includes(p.category));
        return (
      <div style={S.statsBar}>
        <div onClick={(e) => { e.preventDefault(); setStatusFilter(statusFilter === "active" ? "all" : "active"); }} style={{ ...S.statItem, cursor: "pointer", padding: "4px 6px", borderRadius: 8, background: statusFilter === "active" ? "#1B496514" : "transparent", flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: appMode === "pet" ? "#7B4BB2" : "#1B4965", display: "block" }}>{modePosts.filter(p => !p.hidden && !p.resolved).length}</span>
          <span style={{ fontSize: 10, color: "#5A7184", fontWeight: statusFilter === "active" ? 700 : 400 }}>{appMode === "pet" ? t.statPetLost : t.statSearching}</span>
        </div>
        <div style={{ width: 1, height: 28, background: "#DDE4EC", flexShrink: 0 }} />
        <div onClick={(e) => { e.preventDefault(); setStatusFilter(statusFilter === "resolved" ? "all" : "resolved"); }} style={{ ...S.statItem, cursor: "pointer", padding: "4px 6px", borderRadius: 8, background: statusFilter === "resolved" ? "#2D8A5E14" : "transparent", flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#2D8A5E", display: "block" }}>{modePosts.filter(p => p.resolved).length}</span>
          <span style={{ fontSize: 10, color: "#5A7184", fontWeight: statusFilter === "resolved" ? 700 : 400 }}>{appMode === "pet" ? t.statPetFound : t.statFound}</span>
        </div>
        <div style={{ width: 1, height: 28, background: "#DDE4EC", flexShrink: 0 }} />
        <div onClick={(e) => { e.preventDefault(); setRewardFilter(!rewardFilter); }} style={{ ...S.statItem, cursor: "pointer", padding: "4px 6px", borderRadius: 8, background: rewardFilter ? "#D4880F14" : "transparent", flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#D4880F", display: "block" }}>NT${modePosts.filter(p => !p.hidden && !p.resolved && p.reward > 0).reduce((sum, p) => sum + (p.reward || 0), 0).toLocaleString()}</span>
          <span style={{ fontSize: 10, color: "#5A7184", fontWeight: rewardFilter ? 700 : 400 }}>{appMode === "pet" ? t.statPetReward : t.statReward}</span>
        </div>
      </div>
        );
      })()}

      {/* Inspirational banner */}
      <div style={{ margin: "0 16px 8px", padding: "14px 16px", background: "linear-gradient(135deg, #FCE4EC, #F8BBD0)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#C2185B" }}>{t.encourageTitle}</div>
          <div style={{ fontSize: 12, color: "#5A7184", marginTop: 4 }}>{t.encourageDesc}</div>
        </div>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🎒</div>
      </div>

      {/* Category filter tabs */}
      <div id="catTabs">
      {appMode === "item" && (
      <div style={{ display: "flex", margin: "0 16px 8px", background: "#fff", borderRadius: 14, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", gap: 4 }}>
        <button onClick={(e) => { e.preventDefault(); setCatGroup("all"); setFilter("all"); }} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: catGroup === "all" ? "linear-gradient(135deg, #1B4965, #2D6E9E)" : "transparent", color: catGroup === "all" ? "#fff" : "#5A7184", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.all}</button>
        <button onClick={(e) => { e.preventDefault(); setCatGroup("airport"); setFilter("all"); }} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: catGroup === "airport" ? "linear-gradient(135deg, #E05A33, #D4880F)" : "transparent", color: catGroup === "airport" ? "#fff" : "#5A7184", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✈️ {t.grpAirport}</button>
        <button onClick={(e) => { e.preventDefault(); setCatGroup("general"); setFilter("all"); }} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: catGroup === "general" ? "linear-gradient(135deg, #2D8A5E, #28A06E)" : "transparent", color: catGroup === "general" ? "#fff" : "#5A7184", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔍 {t.grpGeneral}</button>
      </div>
      )}

      <div style={S.filterRow}>
        <button onClick={(e) => { e.preventDefault(); setFilter("all"); }} style={{ ...S.filterChip, background: filter === "all" ? (appMode === "pet" ? "#7B4BB2" : "#1B4965") : "#EEF2F7", color: filter === "all" ? "#fff" : "#5A7184" }}>{ t.all }</button>
        {CATEGORIES.filter(c => {
          if (appMode === "pet") return PET_CATS.includes(c.id);
          if (PET_CATS.includes(c.id)) return false;
          if (catGroup === "all") return true;
          if (catGroup === "airport") return AIRPORT_CATS.includes(c.id);
          return GENERAL_CATS.includes(c.id);
        }).map(c => (<button key={c.id} onClick={(e) => { e.preventDefault(); setFilter(c.id); }} style={{ ...S.filterChip, background: filter === c.id ? c.color + "20" : "#EEF2F7", color: filter === c.id ? c.color : "#5A7184", display: "flex", alignItems: "center", gap: 4 }}>{c.img ? <img src={c.img} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} /> : c.icon} {catLabel(c)}</button>))}
      </div>
      </div>

      {appMode === "item" && (
      <div style={{ display: "flex", gap: 8, padding: "0 16px 8px" }}>
        <select value={airportFilter} onChange={e => setAirportFilter(e.target.value)} style={{ ...S.select, fontSize: 13, padding: "6px 10px", flex: 1 }}><option value="">{ t.allAirports }</option>{[...sortedAirports, t.other].map(a => <option key={a} value={a}>{a}</option>)}</select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ ...S.select, fontSize: 13, padding: "6px 10px", flex: 1 }}><option value="">{ t.allDates }</option>{[...new Set(posts.map(p => p.date))].sort((a, b) => b.localeCompare(a)).map(d => <option key={d} value={d}>{d}</option>)}</select>
      </div>
      )}

      {isAdmin && (
        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: showHidden ? 8 : 0 }}>
            <button onClick={() => setShowHidden(!showHidden)} style={{ ...S.filterChip, background: showHidden ? "#E05A33" : "#EEF2F7", color: showHidden ? "#fff" : "#E05A33", border: "none" }}>
              🚫 已隱藏 ({hiddenCount}) {showHidden ? "▲" : "▼"}
            </button>
            {showHidden && <button onClick={async () => {
              if (!confirm("永久刪除所有 " + hiddenCount + " 筆已隱藏留言？此操作無法復原。")) return;
              const hiddenPosts = posts.filter(p => p.hidden);
              for (const p of hiddenPosts) {
                try { await saveClaimedReward(p.id); await deleteDoc(doc(db, "posts", p.id)); } catch {}
              }
              setShowHidden(false);
            }} style={{ ...S.filterChip, background: "#E05A33", color: "#fff", border: "none", fontSize: 12 }}>
              🗑️ 全部永久刪除
            </button>}
          </div>
          {showHidden && posts.filter(p => p.hidden).map(p => {
            const cat = catInfo(p.category);
            return (
              <div key={p.id} onClick={() => { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }} style={{ padding: 12, background: "#FFF5F5", borderRadius: 12, marginBottom: 6, cursor: "pointer", borderLeft: "4px solid #E05A33", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, background: cat.color + "15", color: cat.color, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{cat.img ? <img src={cat.img} alt="" style={{width:16,height:16,objectFit:"contain",verticalAlign:"middle",marginRight:2}} /> : cat.icon} {catLabel(cat)}</span>
                    <span style={{ fontSize: 11, color: "#E05A33", fontWeight: 700 }}>🚫 已隱藏</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#8896A6" }}>👤 {p.authorName} · 📍 {p.airport || p.locationText || "—"} · 📅 {p.date || ""}</div>
                </div>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm("永久刪除「" + p.title + "」？")) return;
                  try { await saveClaimedReward(p.id); await deleteDoc(doc(db, "posts", p.id)); } catch(err) { alert("刪除失敗"); }
                }} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: "4px 8px" }}>🗑️</button>
              </div>
            );
          })}
        </div>
      )}

      <div style={S.feedList}>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#8896A6" }}><div style={{ fontSize: 40 }}>📭</div><p>{ t.noResults }</p></div>}
        {filtered.map(p => {
          const cat = catInfo(p.category);
          const postAgeDays = p.createdAt?.toDate ? (Date.now() - p.createdAt.toDate().getTime()) / 86400000 : 0;
          const isBoosted = !p.resolved && !p.hidden && postAgeDays >= 14;
          const isOld = !p.resolved && !p.hidden && postAgeDays >= 7 && !isBoosted;
          return (
            <div key={p.id} onClick={() => { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }} style={{ ...S.postCard, opacity: p.resolved ? 0.65 : 1 }}>
              {/* Row 1: avatar + category + time */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span onClick={(e) => { e.stopPropagation(); viewAuthorProfile(p.authorUid, p.authorName, p.authorAvatar); }} style={{ cursor: "pointer" }}><AvatarCircle name={p.authorName} avatar={p.authorAvatar} size={22} /></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{cat.img ? <img src={cat.img} alt="" style={{width:16,height:16,objectFit:"contain",verticalAlign:"middle",marginRight:2}} /> : cat.icon} {catLabel(cat)}</span>
                  {p.pinned && <span style={{ fontSize: 10, color: "#D4880F" }}>📌</span>}
                  {isBoosted && <span style={{ fontSize: 10, color: "#E05A33" }}>📢 急尋</span>}
                  {isOld && <span style={{ fontSize: 10, color: "#E05A33" }}>🔥</span>}
                  {p.resolved && <span style={{ fontSize: 10, color: "#2D8A5E" }}>✅ 已尋回</span>}
                </div>
                <span style={{ fontSize: 11, color: "#B0BEC5" }}>{timeAgo(p.date, t)}</span>
              </div>
              {/* Row 2: title */}
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: p.resolved ? "#8896A6" : "#1A2B3C", lineHeight: 1.4 }}>{p.title}</h3>
              {/* Row 3: photo thumbnails */}
              {p.photos?.length > 0 && !isPhotoExpired(p.photosUploadedAt) && (
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  {p.photos.slice(0, 3).map((src, i) => <div key={i} style={{ position: "relative", width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}><img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} onContextMenu={e => e.preventDefault()} /></div>)}
                </div>
              )}
              {/* Row 4: location + reward */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#5A7184" }}>📍 {p.locationText || p.airport || "—"}</span>
                {p.reward > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#2D8A5E" }}>💰 NT${p.reward.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
      </>}

      {/* Ad before footer */}
      {showHomeAds && <AdBanner />}

      {/* Official channels */}
      {feedMode === "list" && (
        <div style={{ margin: "0 16px 16px", background: "#F7F9FC", borderRadius: 14, padding: 16, border: "1px solid #E8EDF2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, cursor: "pointer" }} onClick={() => setShowChannels(!showChannels)}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#1B4965" }}>🔗 安全合法的遺失物查詢管道</span>
            <span style={{ fontSize: 12, color: "#8896A6", transition: "transform 0.2s", transform: showChannels ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </div>
          {showChannels && (
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 2 }}>
              <div onClick={() => window.open("https://op2.npa.gov.tw/", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>🚔 <span style={{ fontWeight: 600, color: "#1B4965" }}>警政署拾得遺失物管理系統</span><br/><span style={{ color: "#8896A6" }}>全國最大整合平台，所有交給警方的遺失物</span></div>
              <div onClick={() => window.open("https://www.pbs.gov.tw/cht/index.php?code=list&ids=164", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>📻 <span style={{ fontWeight: 600, color: "#1B4965" }}>警察廣播電臺招領遺失物</span><br/><span style={{ color: "#8896A6" }}>24 小時受理，拍照公告供查詢</span></div>
              <div onClick={() => window.open("https://www.thsrc.com.tw/ArticleContent/83cbc68f-d82a-4b6e-9540-82a885f8e512", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>🚄 <span style={{ fontWeight: 600, color: "#1B4965" }}>台灣高鐵遺失物查詢</span><br/><span style={{ color: "#8896A6" }}>線上查詢，各車站服務台認領</span></div>
              <div onClick={() => window.open("https://www.railway.gov.tw/tra-tip-web/tip/tip00E/tipE11/goTE11", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>🚃 <span style={{ fontWeight: 600, color: "#1B4965" }}>台鐵遺失物公告</span><br/><span style={{ color: "#8896A6" }}>客服 0800-765-888</span></div>
              <div onClick={() => window.open("https://www.metro.taipei/cp.aspx?n=928115B7D5B514D5", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>🚇 <span style={{ fontWeight: 600, color: "#1B4965" }}>台北捷運遺失物服務</span><br/><span style={{ color: "#8896A6" }}>AI 智慧客服協尋，每小時更新</span></div>
              <div onClick={() => window.open("https://www.apb.npa.gov.tw/ch/app/webLink/list?module=webLink&id=2381", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>✈️ <span style={{ fontWeight: 600, color: "#1B4965" }}>航空警察局遺失物查詢</span><br/><span style={{ color: "#8896A6" }}>機場管制區內遺失物</span></div>
              <div onClick={() => window.open("https://www.npa.gov.tw/ch/app/folder/389", "_blank")} style={{ cursor: "pointer", padding: "6px 0" }}>🚔 <span style={{ fontWeight: 600, color: "#1B4965" }}>各地警察機關查詢</span><br/><span style={{ color: "#8896A6" }}>拾獲物品請就近報案（民法第 803 條）</span></div>
              <div style={{ borderTop: "1.5px solid #E8EDF2", marginTop: 6, paddingTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7B4BB2", marginBottom: 6 }}>🐾 寵物走失相關</div>
              </div>
              <div onClick={() => window.open("https://www.pet.gov.tw/", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>🏥 <span style={{ fontWeight: 600, color: "#1B4965" }}>全國動物收容管理系統</span><br/><span style={{ color: "#8896A6" }}>查詢各地收容所收容動物</span></div>
              <div onClick={() => window.open("https://www.pet.gov.tw/AnimalApp/AnnounceLost.aspx", "_blank")} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #EEF2F7" }}>📋 <span style={{ fontWeight: 600, color: "#1B4965" }}>寵物走失公告系統</span><br/><span style={{ color: "#8896A6" }}>農委會官方走失寵物協尋</span></div>
              <div onClick={() => window.open("https://animal.coa.gov.tw/", "_blank")} style={{ cursor: "pointer", padding: "6px 0" }}>🐕 <span style={{ fontWeight: 600, color: "#1B4965" }}>動物保護資訊網</span><br/><span style={{ color: "#8896A6" }}>各縣市動保處聯絡方式、通報專線 1959</span></div>
            </div>
          )}
        </div>
      )}

      {/* Sponsor */}
      <div style={{ margin: "0 16px 16px", padding: "20px", background: "linear-gradient(135deg, #1B496510, #2D8A5E10)", borderRadius: 16, border: "1px solid #1B496520", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>☕</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1B4965", marginBottom: 6 }}>☕ 請作者喝杯咖啡</div>
        <p style={{ fontSize: 12, color: "#5A7184", margin: "0 0 12px", lineHeight: 1.6 }}>What'sfind 是免費平台，您的支持能幫助我們持續營運，讓更多遺失物品找到回家的路。</p>
        <button onClick={() => setShowDonateInfo(true)} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2D8A5E, #28A06E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💚 贊助支持</button>
        <div style={{ fontSize: 11, color: "#8896A6", marginTop: 8 }}>用途：主機維運 · 網域費用 · 功能開發</div>
      </div>

      {/* Donate QR Code Modal */}
      {showDonateInfo && (
        <div style={S.modalOverlay} onClick={() => setShowDonateInfo(false)}>
          <div style={{ ...S.modalCard, maxWidth: 340, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>💚 掃碼贊助</h3>
              <button onClick={() => setShowDonateInfo(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#5A7184", marginBottom: 12 }}>使用 iPASS MONEY 或 LINE 掃描下方 QR Code 即可轉帳贊助</p>
            <img id="donateQrImg" src="/donate-qr.jpg" alt="贊助 QR Code" style={{ width: "80%", maxWidth: 220, borderRadius: 12, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              <button onClick={async () => {
                try {
                  const res = await fetch("/donate-qr.jpg");
                  const blob = await res.blob();
                  const file = new File([blob], "whatsfind-donate-qr.jpg", { type: "image/jpeg" });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: "What'sfind 贊助 QR Code" });
                  } else {
                    setLightbox({ photos: ["/donate-qr.jpg"], index: 0 });
                    alert("📱 長按圖片即可儲存到相簿");
                  }
                } catch(e) {
                  setLightbox({ photos: ["/donate-qr.jpg"], index: 0 });
                  alert("📱 長按圖片即可儲存到相簿");
                }
              }} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💾 儲存 QR Code</button>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, fontSize: 11, color: "#5A7184", lineHeight: 1.8 }}>
              📱 手機操作：長按圖片儲存 → 開啟 iPASS MONEY → 掃描 → 從相簿選擇
            </div>
            <p style={{ fontSize: 11, color: "#8896A6", margin: "8px 0 0" }}>感謝您的支持 ❤️</p>
            <button onClick={() => setShowDonateInfo(false)} style={{ ...S.modalSecondaryBtn, marginTop: 12 }}>關閉</button>
          </div>
        </div>
      )}

      {/* Footer - always visible */}
      <div style={{ ...S.footer, marginBottom: 20 }}>
        <div style={S.footerWarning}>
          <p style={S.footerWarningTitle}>{t.warning}</p>
          <p style={S.footerWarningText}>{t.warningText}</p>
        </div>
        <div style={S.footerCopyright}>
          <p style={{ margin: "0 0 4px" }}><span style={{ fontSize: 18, fontWeight: 900, color: "#1B4965", letterSpacing: -0.8 }}>what<span style={{ position: "relative", display: "inline-block", width: 0 }}><span style={{ position: "absolute", bottom: "100%", marginBottom: 1, left: -2, width: 4, height: 6, background: "#4ADE80", borderRadius: 2 }}></span></span>sfind</span></p>
          <p style={{ margin: "0 0 8px" }}>{t.copyright}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={S.footerLink} onClick={() => window.open("/posting-guide.html", "_blank")}>📋 發文教學</span>
            <span style={S.footerLink} onClick={() => setLegalModal("terms")}>{ t.terms }</span>
            <span style={S.footerLink} onClick={() => setLegalModal("privacy")}>{ t.privacy }</span>
            <span style={S.footerLink} onClick={() => { setLegalModal("contact"); setContactSent(false); setContactMessage(""); }}>{ t.contactUs }</span>
            <span style={S.footerLink} onClick={() => window.open("/verify.html", "_blank")}>🛡️ 官方驗證</span>
          </div>
        </div>
      </div>

      {legalModal && (
        <div style={S.modalOverlay}><div style={{ ...S.modalCard, maxHeight: "85vh", overflowY: "auto", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>{legalModal === "terms" ? "📄 服務條款" : legalModal === "privacy" ? "🔐 隱私權政策" : "📬 聯絡我們"}</h3>
            <button onClick={() => setLegalModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
          </div>
          {legalModal === "terms" && <div style={S.legalContent}><pre style={{ ...S.legalP, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{t.termsContent}</pre></div>}
          {legalModal === "privacy" && <div style={S.legalContent}><pre style={{ ...S.legalP, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{t.privacyContent}</pre></div>}
          {legalModal === "contact" && <div style={S.legalContent}>
            <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📞 客服管道</div>
              <div onClick={() => window.location.href = "mailto:whatsfind@gmail.com"} style={{ fontSize: 13, color: "#5A7184", padding: "6px 0", cursor: "pointer" }}>📧 <span style={{ color: "#1B4965", fontWeight: 600 }}>whatsfind@gmail.com</span></div>
              <div onClick={() => window.open("https://line.me/R/ti/p/@827hodtb", "_blank")} style={{ fontSize: 13, color: "#5A7184", padding: "6px 0", cursor: "pointer" }}>💚 <span style={{ color: "#06C755", fontWeight: 600 }}>LINE 官方帳號 @827hodtb</span></div>
            </div>
            {!contactSent ? (<>
              <p style={{ fontSize: 14, color: "#5A7184", marginBottom: 16 }}>有問題或建議？直接留言給 What'sfind 管理員，我們會儘快回覆。</p>
              {user ? (<>
                <div style={{ fontSize: 13, color: "#1B4965", fontWeight: 600, marginBottom: 8 }}>👤 {user.name}（{user.email}）</div>
                <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="請輸入您的問題或建議⋯" style={{ ...S.textarea, minHeight: 100 }} />
                <button onClick={async () => {
                  if (!contactMessage.trim()) return;
                  try {
                    await addDoc(collection(db, "contactMessages"), {
                      uid: user.uid, name: user.name, email: user.email,
                      message: contactMessage, read: false,
                      createdAt: serverTimestamp(),
                    });
                    setContactSent(true); setContactMessage("");
                  } catch { alert("送出失敗，請稍後再試"); }
                }} style={{ ...S.modalPrimaryBtn, marginTop: 12, opacity: contactMessage.trim() ? 1 : 0.5 }}>📤 送出</button>
              </>) : (
                <button onClick={() => { setLegalModal(null); setView("login"); }} style={S.modalPrimaryBtn}>請先登入</button>
              )}
            </>) : (<>
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <h3 style={{ color: "#2D8A5E", margin: "12px 0 8px" }}>已送出！</h3>
                <p style={{ color: "#5A7184", fontSize: 14 }}>What'sfind 管理員會盡快查看您的訊息。</p>
              </div>
            </>)}
          </div>}
          <button onClick={() => setLegalModal(null)} style={{ ...S.modalPrimaryBtn, marginTop: 16 }}>關閉</button>
        </div></div>
      )}

      {/* Notification Panel */}
      {showNotifPanel && (<>
        <div onClick={() => setShowNotifPanel(false)} style={S.overlay} />
        <div style={S.notifPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #EEF2F7" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1B4965" }}>🔔 { t.notifications }</h3>
            {notifications.length > 0 && <button onClick={async () => {
              for (const n of notifications) {
                try { await updateDoc(doc(db, "userNotifs", n.id), { read: true }); } catch(e) {}
              }
              setNotifications([]);
            }} style={{ background: "none", border: "none", color: "#E05A33", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>全部清除</button>}
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {notifications.length === 0 && <p style={{ textAlign: "center", color: "#8896A6", padding: 30, fontSize: 14 }}>{t.noNotif}</p>}
            {notifications.map(n => (
              <div key={n.id} style={{ ...S.notifItem, position: "relative" }}>
                <div onClick={() => {
                  if (n.type === "chat" && n.roomId) {
                    setChatRoomId(n.roomId);
                    setChatTarget({ uid: n.targetUid, name: n.targetName, avatar: n.targetAvatar || null });
                    currentChatRoomRef.current = n.roomId;
                    setActiveChats(prev => {
                      if (prev.some(c => c.roomId === n.roomId)) return prev.map(c => c.roomId === n.roomId ? { ...c, unread: 0 } : c);
                      return [...prev, { roomId: n.roomId, postId: n.postId, targetUid: n.targetUid, targetName: n.targetName, targetAvatar: n.targetAvatar || null, lastMsg: "", unread: 0, msgCount: 0 }];
                    });
                    setView("chat");
                  } else {
                    const p = posts.find(pp => pp.id === n.postId);
                    if (p) { setSelectedPost(p); setTranslatedText(""); setView("detail"); window.scrollTo(0, 0); }
                  }
                  setShowNotifPanel(false);
                }} style={{ display: "flex", gap: 14, flex: 1, cursor: "pointer" }}>
                  <div style={{ fontSize: 20 }}>{n.type === "claim" ? "🔑" : n.type === "chat" ? "💬" : n.type === "report" ? "🚩" : n.type === "report_found" ? "✅" : n.type === "handover_pending" ? "📦" : n.type === "handover_complete" ? "🎉" : n.type === "pet_help" ? "🐾" : "📝"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1B4965" }}>
                      {n.type === "claim" ? n.from + " 提交了認領申請" : n.type === "chat" ? n.from + " 傳了新訊息" : n.type === "report" ? "⚠️ " + n.postTitle : n.type === "report_found" ? "✅ " + n.from + " 回報「" + n.postTitle + "」疑似已尋回" : n.type === "handover_pending" ? n.from + " 已確認交接，等待您確認" : n.type === "handover_complete" ? "🎉 雙方已完成交接！" : n.type === "pet_help" ? n.from + " 想協尋「" + n.postTitle + "」" : n.from + " 回覆了留言"}
                    </div>
                    <div style={{ fontSize: 12, color: "#5A7184", marginTop: 2 }}>{n.postTitle}</div>
                    <div style={{ fontSize: 11, color: "#8896A6", marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  try { await updateDoc(doc(db, "userNotifs", n.id), { read: true }); } catch(e) {}
                  setNotifications(prev => prev.filter(nn => nn.id !== n.id));
                }} style={{ background: "none", border: "none", color: "#B0BEC5", cursor: "pointer", fontSize: 16, padding: "4px 8px", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* Chat list panel */}
      {showChatList && (<>
        <div onClick={() => setShowChatList(false)} style={S.overlay} />
        <div style={{ ...S.chatListPanel, bottom: "calc(70px + env(safe-area-inset-bottom, 0px))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #EEF2F7" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1B4965" }}>💬 聊天室</h3>
            <button onClick={() => setShowChatList(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8896A6" }}>✕</button>
          </div>
          {activeChats.length === 0 && <div style={{ textAlign: "center", padding: "30px 20px", color: "#8896A6" }}><div style={{ fontSize: 36, marginBottom: 8 }}>💬</div><p style={{ fontSize: 14 }}>目前沒有聊天室</p><p style={{ fontSize: 12 }}>認領通過後即可與對方聊天</p></div>}
          {[...activeChats].sort((a, b) => {
            const timeA = a.lastMsgAt?.toDate?.()?.getTime() || a.lastMsgAt || 0;
            const timeB = b.lastMsgAt?.toDate?.()?.getTime() || b.lastMsgAt || 0;
            return timeB - timeA;
          }).map(c => {
            const chatPost = posts.find(pp => pp.id === c.postId);
            const hasUnread = c.unread > 0;
            return (
            <div key={c.roomId} style={{ ...S.chatListItem, position: "relative", background: hasUnread ? "#EBF5FB" : "#fff" }}>
              <div onClick={() => {
                setChatRoomId(c.roomId);
                setChatTarget({ uid: c.targetUid, name: c.targetName, avatar: c.targetAvatar || null });
                currentChatRoomRef.current = c.roomId;
                setActiveChats(prev => prev.map(cc => cc.roomId === c.roomId ? { ...cc, unread: 0 } : cc));
                setShowChatList(false);
                setView("chat");
              }} style={{ display: "flex", gap: 10, flex: 1, alignItems: "center", cursor: "pointer" }}>
                {/* Blue dot for unread */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: hasUnread ? "#1E90FF" : "transparent", flexShrink: 0 }} />
                <AvatarCircle name={c.targetName} avatar={c.targetAvatar} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: hasUnread ? 800 : 600, fontSize: 14, color: "#1B4965" }}>{c.targetName}</span>
                    {hasUnread && <span style={{ fontSize: 11, color: "#fff", background: "#1E90FF", borderRadius: 10, padding: "1px 7px", fontWeight: 700 }}>{c.unread}</span>}
                  </div>
                  {chatPost && <div style={{ fontSize: 11, color: "#D4880F", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📋 {chatPost.title}</div>}
                  <div style={{ fontSize: 12, color: hasUnread ? "#1B4965" : "#8896A6", fontWeight: hasUnread ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg || "開始對話"}</div>
                </div>
              </div>
              <button onClick={(e) => {
                e.stopPropagation();
                if (confirm("確定要移除此聊天室？")) {
                  setActiveChats(prev => prev.filter(cc => cc.roomId !== c.roomId));
                }
              }} style={{ background: "none", border: "none", color: "#B0BEC5", cursor: "pointer", fontSize: 14, padding: "4px 8px", flexShrink: 0 }}>✕</button>
            </div>
            );
          })}
        </div>
      </>)}

      {/* Author Profile Modal */}
      {authorProfile && (
        <div style={S.modalOverlay} onClick={() => setAuthorProfile(null)}>
          <div style={{ ...S.modalCard, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>👤 用戶資料</h3>
              <button onClick={() => setAuthorProfile(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <AvatarCircle name={authorProfile.name} avatar={authorProfile.avatar} size={56} />
              <h3 style={{ margin: "10px 0 4px", color: "#1B4965", fontSize: 18 }}>{authorProfile.name}</h3>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 10, background: authorProfile.score >= 80 ? "#2D8A5E14" : authorProfile.score >= 50 ? "#D4880F14" : "#E05A3314", color: authorProfile.score >= 80 ? "#2D8A5E" : authorProfile.score >= 50 ? "#D4880F" : "#E05A33" }}>
                {authorProfile.score >= 80 ? "🏆" : authorProfile.score >= 50 ? "⚠️" : "❌"} 信用 {authorProfile.score} 分
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1B4965" }}>{authorProfile.postCount}</div>
                <div style={{ fontSize: 11, color: "#5A7184" }}>發文</div>
              </div>
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#2D8A5E" }}>{authorProfile.resolvedCount}</div>
                <div style={{ fontSize: 11, color: "#5A7184" }}>尋回</div>
              </div>
              <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#D4880F" }}>⭐ {authorProfile.avg}</div>
                <div style={{ fontSize: 11, color: "#5A7184" }}>{authorProfile.ratingCount} 評價</div>
              </div>
            </div>
            {authorProfile.ratings?.length > 0 && (
              <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 12, borderTop: "1px solid #EEF2F7", paddingTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 6 }}>收到的評價：</div>
                {authorProfile.ratings.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 12 }}>
                    <span style={{ color: "#5A7184" }}>{r.raterName || "匿名用戶"}</span>
                    <span>{"⭐".repeat(r.stars)}</span>
                  </div>
                ))}
              </div>
            )}
            {isAdmin && authorProfile.uid !== user.uid && (
              <div style={{ borderTop: "1px solid #EEF2F7", paddingTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>👑 管理員操作</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={async () => {
                    const count = parseInt(prompt("給予幾次免費置頂？", "1"));
                    if (!count || count <= 0) return;
                    try {
                      const rDoc = await getDoc(doc(db, "referrals", authorProfile.uid));
                      if (!rDoc.exists()) {
                        await setDoc(doc(db, "referrals", authorProfile.uid), { code: authorProfile.uid.substring(0, 8).toUpperCase(), count: count, referredBy: null });
                      } else {
                        await updateDoc(doc(db, "referrals", authorProfile.uid), { count: increment(count) });
                      }
                      logAdminAction("給予置頂獎勵", authorProfile.uid + " +" + count + "次");
                      alert("已給予 " + authorProfile.name + " " + count + " 次免費置頂！");
                    } catch(e) { alert("失敗：" + e.message); }
                  }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#D4880F", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📌 給予置頂</button>
                  <button onClick={async () => {
                    if (!confirm("確定要封鎖 " + authorProfile.name + "？")) return;
                    try {
                      await setDoc(doc(db, "config", "blockedUsers"), { list: [...blockedUsers, authorProfile.uid] });
                      logAdminAction("封鎖用戶", authorProfile.name + " " + authorProfile.uid);
                      alert("已封鎖 " + authorProfile.name);
                    } catch(e) { alert("失敗：" + e.message); }
                  }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#E05A33", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚫 封鎖用戶</button>
                </div>
              </div>
            )}
            <button onClick={() => setAuthorProfile(null)} style={S.modalPrimaryBtn}>關閉</button>
          </div>
        </div>
      )}

      {/* Post Share Card Modal */}
      {showPostShareCard && (
        <div style={S.modalOverlay} onClick={() => setShowPostShareCard(null)}>
          <div style={{ ...S.modalCard, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#1B4965", fontSize: 16, fontWeight: 800 }}>📤 分享貼文</h3>
              <button onClick={() => setShowPostShareCard(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
            </div>
            <img ref={postShareImgRef} alt="share" style={{ width: "100%", borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={async () => {
                const img = postShareImgRef.current;
                if (!img) return;
                try {
                  const res = await fetch(img.src);
                  const blob = await res.blob();
                  const file = new File([blob], "whatsfind-post.png", { type: "image/png" });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: showPostShareCard.post.title, text: showPostShareCard.text });
                  } else {
                    const a = document.createElement("a"); a.href = img.src; a.download = "whatsfind-post.png"; a.click();
                  }
                } catch(e) { window.open(img.src, "_blank"); }
              }} style={{ ...S.modalPrimaryBtn, flex: 1, marginBottom: 0, fontSize: 13 }}>💾 儲存圖片</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => shareImageToSocial("all")} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📤 分享到社群（含圖片）</button>
              <button onClick={() => shareImageToSocial("copy")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#EEF2F7", color: "#1B4965", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📋 複製連結</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div style={S.modalOverlay}><div style={S.modalCard}>
          <h3 style={S.modalTitle}>📤 分享</h3>
          <p style={S.modalDesc}>{showShareModal.title}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <button onClick={() => { window.open("https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(showShareModal.url), "_blank"); }} style={{ ...S.modalPrimaryBtn, background: "#06C755" }}>💬 分享到 LINE</button>
            <button onClick={() => { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(showShareModal.url), "_blank"); }} style={{ ...S.modalPrimaryBtn, background: "#1877F2" }}>📘 分享到 Facebook</button>
            <button onClick={() => { window.open("https://www.threads.net/intent/post?text=" + encodeURIComponent(showShareModal.text + " " + showShareModal.url), "_blank"); }} style={{ ...S.modalPrimaryBtn, background: "#000" }}>🔗 分享到 Threads</button>
            <button onClick={() => { navigator.clipboard.writeText(showShareModal.text + " " + showShareModal.url); alert("已複製！貼到 Instagram 限時動態或貼文"); }} style={{ ...S.modalPrimaryBtn, background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>📸 複製到 Instagram</button>
            <button onClick={() => { navigator.clipboard.writeText(showShareModal.url); alert("連結已複製！"); }} style={{ ...S.modalPrimaryBtn, background: "#1B4965" }}>📋 複製連結</button>
          </div>
          <button onClick={() => setShowShareModal(false)} style={S.modalSecondaryBtn}>{t.close}</button>
        </div></div>
      )}


      {/* Admin Dashboard */}
      {showDashboard && (
        <div style={S.modalOverlay}><div style={{ ...S.modalCard, maxHeight: "85vh", overflowY: "auto", maxWidth: 500 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>{t.dashboard}</h3>
            <button onClick={() => setShowDashboard(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
          </div>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#E8F0FE", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1565C0" }}>{totalUsers}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>👤 註冊用戶</div>
            </div>
            <div style={{ background: "#EBF5FB", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1B4965" }}>{posts.length}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>{t.totalPosts}</div>
            </div>
            <div style={{ background: "#FFF8E1", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#D4880F" }}>{posts.filter(p => !p.resolved && !p.hidden).length}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>{t.activePosts}</div>
            </div>
            <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#2D8A5E" }}>{totalResolved}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>{t.resolvedPosts}</div>
            </div>
            <div style={{ background: "#FFF0F0", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#E05A33" }}>{hiddenCount}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>{t.hiddenPosts}</div>
            </div>
            <div style={{ background: "#F3E5F5", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#7B1FA2" }}>{new Set(posts.map(p => p.authorUid)).size}</div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>✍️ 發文用戶</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1B4965" }}>{posts.length > 0 ? Math.round(posts.filter(p => p.resolved).length / posts.length * 100) : 0}%</div>
              <div style={{ fontSize: 13, color: "#5A7184" }}>{t.resolveRate}</div>
            </div>
            <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#2D8A5E" }}>NT${(posts.filter(p => p.resolved && p.reward > 0).reduce((s, p) => s + (p.reward || 0), 0) + savedClaimedReward).toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "#5A7184" }}>🎉 已領感謝金</div>
            </div>
          </div>

          {/* Google Analytics realtime */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>👥 即時在線人數</h4>
          <div style={{ background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)", borderRadius: 12, padding: 14, marginBottom: 16, border: "1.5px solid #A5D6A7" }}>
            <div style={{ fontSize: 12, color: "#5A7184", lineHeight: 1.7, marginBottom: 10 }}>
              即時在線人數由 Google Analytics 提供，不消耗 Firestore 額度。
            </div>
            <a href="https://analytics.google.com/analytics/web/#/p0/realtime/overview" target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #2D8A5E, #28A06E)", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
              📊 開啟 Google Analytics 即時報表
            </a>
            <div style={{ fontSize: 10, color: "#8896A6", marginTop: 8, textAlign: "center" }}>
              追蹤 ID: G-XLD8PMDK0M
            </div>
          </div>

          {/* Firestore Usage Monitor */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📊 Firestore 用量監控</h4>
          {(() => {
            const postCount = posts.length;
            const photoCount = posts.reduce((s, p) => s + (p.photos?.length || 0), 0);
            const chatCount = activeChats.length;
            const estStorageMB = Math.round((photoCount * 150 + postCount * 5 + chatCount * 50) / 1024 * 10) / 10;
            const estReadDaily = postCount * 3 + chatCount * 20;
            const storagePct = Math.min(100, Math.round(estStorageMB / 1024 * 100));
            const readPct = Math.min(100, Math.round(estReadDaily / 50000 * 100));
            return (
            <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1B4965" }}>{postCount}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>📝 總貼文</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#D4880F" }}>{photoCount}</div>
                  <div style={{ fontSize: 11, color: "#5A7184" }}>📷 總照片</div>
                </div>
              </div>
              {/* Storage bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5A7184", marginBottom: 4 }}>
                  <span>💾 預估儲存空間</span>
                  <span style={{ fontWeight: 700, color: storagePct > 80 ? "#E05A33" : storagePct > 50 ? "#D4880F" : "#2D8A5E" }}>{estStorageMB} MB / 1,024 MB</span>
                </div>
                <div style={{ background: "#DDE4EC", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ width: storagePct + "%", height: "100%", borderRadius: 6, background: storagePct > 80 ? "linear-gradient(90deg,#E05A33,#D4880F)" : storagePct > 50 ? "linear-gradient(90deg,#D4880F,#E9A825)" : "linear-gradient(90deg,#2D8A5E,#28A06E)", transition: "width 0.5s" }} />
                </div>
              </div>
              {/* Daily reads bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5A7184", marginBottom: 4 }}>
                  <span>📖 預估每日讀取</span>
                  <span style={{ fontWeight: 700, color: readPct > 80 ? "#E05A33" : readPct > 50 ? "#D4880F" : "#2D8A5E" }}>{estReadDaily.toLocaleString()} / 50,000</span>
                </div>
                <div style={{ background: "#DDE4EC", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ width: readPct + "%", height: "100%", borderRadius: 6, background: readPct > 80 ? "linear-gradient(90deg,#E05A33,#D4880F)" : readPct > 50 ? "linear-gradient(90deg,#D4880F,#E9A825)" : "linear-gradient(90deg,#2D8A5E,#28A06E)", transition: "width 0.5s" }} />
                </div>
              </div>
              {/* Warning */}
              {storagePct > 60 && <div style={{ padding: "8px 10px", background: "#FFF3E0", borderRadius: 8, fontSize: 11, color: "#E65100", marginBottom: 8 }}>⚠️ 儲存空間超過 {storagePct}%，建議將照片改存到 Firebase Storage</div>}
              {readPct > 60 && <div style={{ padding: "8px 10px", background: "#FFF3E0", borderRadius: 8, fontSize: 11, color: "#E65100" }}>⚠️ 每日讀取超過 {readPct}%，注意免費額度</div>}
              <div style={{ fontSize: 10, color: "#8896A6", marginTop: 6 }}>* 預估值，實際用量請到 Firebase Console 確認</div>
            </div>
            );
          })()}

          {/* Announcement management */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📢 {t.announcement}</h4>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <textarea value={newAnnounce} onChange={e => setNewAnnounce(e.target.value)} placeholder={t.announcePlaceholder} style={{ ...S.textarea, fontSize: 13, padding: "8px 12px", minHeight: 60 }} />
            <button onClick={postAnnouncement} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>{t.publish}</button>
          </div>
          {announcements.map(a => (
            <div key={a.id} style={{ padding: "10px 12px", background: "#F7F9FC", borderRadius: 8, marginBottom: 6 }}>
              {editingAnnounce === a.id ? (
                <div>
                  <textarea value={editAnnounceText} onChange={e => setEditAnnounceText(e.target.value)} style={{ ...S.textarea, fontSize: 13, padding: "8px 12px", minHeight: 50, marginBottom: 6 }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={async () => {
                      try { await updateDoc(doc(db, "announcements", a.id), { text: editAnnounceText }); setEditingAnnounce(null); alert("✅ 公告已更新！"); } catch(e) { console.error(e); alert("更新失敗：" + e.message); }
                    }} style={{ ...S.sendBtn, fontSize: 12, padding: "6px 12px" }}>💾 儲存</button>
                    <button onClick={() => setEditingAnnounce(null)} style={{ ...S.miniBtn, background: "#8896A6", color: "#fff" }}>取消</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#2C3E50", fontSize: 13, whiteSpace: "pre-wrap" }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: "#8896A6" }}>{a.createdAt?.toDate?.()?.toLocaleDateString("zh-TW") || ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditingAnnounce(a.id); setEditAnnounceText(a.text); }} style={{ background: "none", border: "none", color: "#1B4965", cursor: "pointer", fontSize: 14 }}>✏️</button>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Blocked users */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>🚫 封鎖名單 ({blockedUsers.length})</h4>
          {blockedUsers.length === 0 && <p style={{ fontSize: 13, color: "#8896A6", padding: "8px 0" }}>無封鎖用戶</p>}
          {blockedUsers.map(b => (
            <div key={b.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FFF0F0", borderRadius: 8, marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E05A33" }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "#8896A6" }}>封鎖者：{b.blockedBy} · {b.blockedAt?.slice(0, 10)}</div>
              </div>
              <button onClick={() => unblockUser(b.uid)} style={{ ...S.miniBtn, background: "#2D8A5E", color: "#fff" }}>解封</button>
            </div>
          ))}

          {/* Admin tools */}
          {/* Reward amount settings */}
          {/* Reports */}
          {/* Auto-reply bot */}
          {/* Verify hints editor */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>🛡️ 驗證題建議（依類別）</h4>
          <p style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>編輯每個類別的驗證問題建議</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <select id="hintCatSelect" style={{ ...S.select, fontSize: 13, flex: 1 }} value={hintCat} onChange={e => setHintCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {catLabel(c)}</option>)}
            </select>
            <button onClick={async () => {
              if (!confirm("確定要將所有類別的驗證題建議重置為預設值嗎？")) return;
              setVerifyHints({ ...DEFAULT_VERIFY_HINTS });
              await setDoc(doc(db, "config", "verifyHints"), { ...DEFAULT_VERIFY_HINTS });
              alert("已重置為預設值！");
            }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E05A33", background: "#fff", color: "#E05A33", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>🔄 重置預設</button>
          </div>
          <div id="hintList" style={{ marginBottom: 8 }}>
            {(verifyHints[hintCat] || []).map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, flex: 1, color: "#2C3E50" }}>• {h}</span>
                <button onClick={() => {
                  const updated = { ...verifyHints, [hintCat]: verifyHints[hintCat].filter((_, j) => j !== i) };
                  setVerifyHints(updated);
                }} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="newHintInput" placeholder="新增驗證題建議" style={{ ...S.input, flex: 1, fontSize: 13, padding: "8px 12px" }} />
            <button onClick={() => {
              const val = document.getElementById("newHintInput").value.trim();
              if (!val) return;
              const currentHints = verifyHints[hintCat] || [];
              const updated = { ...verifyHints, [hintCat]: [...currentHints, val] };
              setVerifyHints(updated);
              document.getElementById("newHintInput").value = "";
            }} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>新增</button>
          </div>
          <button onClick={async () => {
            try {
              await setDoc(doc(db, "config", "verifyHints"), verifyHints);
              alert("🛡️ 驗證題建議已儲存！");
            } catch(e) { alert("儲存失敗"); }
          }} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💾 儲存驗證題設定</button>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>🤖 自動回覆機器人</h4>
          <p style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>發文內容符合關鍵字時，機器人會自動回覆</p>
          {autoReplies.map((rule, i) => (
            <div key={i} style={{ background: "#F7F9FC", borderRadius: 10, padding: 12, marginBottom: 8, borderLeft: rule.enabled ? "3px solid #2D8A5E" : "3px solid #DDE4EC" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4965" }}>規則 {i + 1}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={async () => {
                    const updated = autoReplies.map((r, j) => j === i ? { ...r, enabled: !r.enabled } : r);
                    setAutoReplies(updated);
                    await setDoc(doc(db, "config", "autoReply"), { rules: updated });
                  }} style={{ ...S.miniBtn, background: rule.enabled ? "#2D8A5E" : "#8896A6", color: "#fff", fontSize: 11 }}>{rule.enabled ? "啟用中" : "已停用"}</button>
                  <button onClick={async () => {
                    const updated = autoReplies.filter((_, j) => j !== i);
                    setAutoReplies(updated);
                    await setDoc(doc(db, "config", "autoReply"), { rules: updated });
                  }} style={{ ...S.miniBtn, background: "#E05A33", color: "#fff", fontSize: 11 }}>刪除</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#5A7184", marginBottom: 4 }}>🔑 關鍵字：<span style={{ color: "#1B4965", fontWeight: 600 }}>{rule.keywords}</span></div>
              <div style={{ fontSize: 12, color: "#5A7184" }}>💬 回覆：<span style={{ color: "#2C3E50" }}>{rule.reply}</span></div>
            </div>
          ))}
          <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1.5px dashed #DDE4EC" }}>
            <input id="botKeywords" placeholder="關鍵字（逗號分隔，如：護照,passport）" style={{ ...S.input, fontSize: 13, padding: "8px 12px", marginBottom: 6 }} />
            <input id="botReply" placeholder="自動回覆內容" style={{ ...S.input, fontSize: 13, padding: "8px 12px", marginBottom: 6 }} />
            <button onClick={async () => {
              const kw = document.getElementById("botKeywords").value.trim();
              const rp = document.getElementById("botReply").value.trim();
              if (!kw || !rp) return alert("請填入關鍵字和回覆內容");
              const updated = [...autoReplies, { keywords: kw, reply: rp, enabled: true }];
              setAutoReplies(updated);
              await setDoc(doc(db, "config", "autoReply"), { rules: updated });
              document.getElementById("botKeywords").value = "";
              document.getElementById("botReply").value = "";
            }} style={{ ...S.sendBtn, width: "100%", fontSize: 13 }}>＋ 新增規則</button>
          </div>

          {/* Reports */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>🚩 檢舉通報 ({reportsList.filter(r => r.status === "pending").length} 待處理 / {reportsList.length} 總計)</h4>
          {reportsList.some(r => r.status !== "pending") && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button onClick={async () => {
                const resolved = reportsList.filter(r => r.status !== "pending");
                for (const r of resolved) { try { await deleteDoc(doc(db, "reports", r.id)); } catch(e) {} }
                setReportsList(prev => prev.filter(r => r.status === "pending"));
              }} style={{ ...S.miniBtn, background: "#8896A6", color: "#fff", fontSize: 12 }}>🗑️ 清除已處理 ({reportsList.filter(r => r.status !== "pending").length})</button>
              <button onClick={async () => {
                if (!confirm("確定要忽略所有待處理的檢舉？")) return;
                for (const r of reportsList.filter(rr => rr.status === "pending")) {
                  try { await updateDoc(doc(db, "reports", r.id), { status: "dismissed" }); } catch(e) {}
                }
                setReportsList(prev => prev.map(r => r.status === "pending" ? { ...r, status: "dismissed" } : r));
              }} style={{ ...S.miniBtn, background: "#D4880F", color: "#fff", fontSize: 12 }}>全部忽略</button>
            </div>
          )}
          {reportsList.length === 0 && <p style={{ fontSize: 13, color: "#8896A6" }}>目前沒有檢舉</p>}
          {reportsList.map(r => (
            <div key={r.id} style={{ padding: "12px", background: r.status === "pending" ? "#FFF0F0" : "#F7F9FC", borderRadius: 10, marginBottom: 8, borderLeft: r.status === "pending" ? "3px solid #E05A33" : "3px solid #2D8A5E" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700, background: r.type === "chat_message" ? "#E3F2FD" : r.type === "report_found" ? "#FFF3E0" : "#FFEBEE", color: r.type === "chat_message" ? "#1565C0" : r.type === "report_found" ? "#E65100" : "#C62828" }}>{r.type === "chat_message" ? "💬 聊天訊息" : r.type === "report_found" ? "📢 回報已找到" : "🚩 貼文檢舉"}</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: r.status === "pending" ? "#E05A3320" : "#2D8A5E20", color: r.status === "pending" ? "#E05A33" : "#2D8A5E", fontWeight: 600 }}>{r.status === "pending" ? "待處理" : r.status === "dismissed" ? "已忽略" : "已處理"}</span>
                  </div>
                  {r.postTitle && <div style={{ fontSize: 13, fontWeight: 700, color: "#E05A33", cursor: "pointer" }} onClick={() => { const p = posts.find(pp => pp.id === r.postId); if (p) { setSelectedPost(p); setTranslatedText(""); setView("detail"); setShowDashboard(false); } }}>📋 「{r.postTitle}」→ 點此查看</div>}
                  {r.messageText && <div style={{ fontSize: 12, color: "#1B4965", background: "#F0F4F8", borderRadius: 6, padding: "6px 8px", marginTop: 4, fontStyle: "italic" }}>「{r.messageText}」</div>}
                  <div style={{ fontSize: 11, color: "#5A7184", marginTop: 4 }}>{r.targetName ? "被檢舉：" + r.targetName : r.postAuthor ? "發文者：" + r.postAuthor : ""}</div>
                  <div style={{ fontSize: 11, color: "#8896A6" }}>檢舉人：{r.reporterName}</div>
                  {r.reason && r.reason !== "用戶檢舉聊天訊息" && <div style={{ fontSize: 11, color: "#8896A6" }}>原因：{r.reason}</div>}
                  <div style={{ fontSize: 10, color: "#B0BEC5" }}>{r.createdAt?.toDate?.()?.toLocaleString("zh-TW") || ""}</div>
                </div>
                {r.status !== "pending" && <span style={{ fontSize: 11, color: r.status === "resolved" ? "#2D8A5E" : "#8896A6", flexShrink: 0 }}>{r.status === "resolved" ? "✅ 已處理" : "已忽略"}</span>}
              </div>
              <div style={{ fontSize: 13, color: "#2C3E50", background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 8, border: "1px solid #EEF2F7" }}>💬 {r.reason}</div>
              {r.status === "pending" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={async () => { adminDeletePost(r.postId); await updateDoc(doc(db, "reports", r.id), { status: "resolved" }); setReportsList(prev => prev.map(rr => rr.id === r.id ? { ...rr, status: "resolved" } : rr)); }} style={{ ...S.miniBtn, background: "#E05A33", color: "#fff" }}>隱藏貼文</button>
                  <button onClick={async () => { await updateDoc(doc(db, "reports", r.id), { status: "dismissed" }); setReportsList(prev => prev.map(rr => rr.id === r.id ? { ...rr, status: "dismissed" } : rr)); }} style={{ ...S.miniBtn, background: "#8896A6", color: "#fff" }}>忽略</button>
                </div>
              )}
            </div>
          ))}

          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>📢 廣告設定</h4>
          <div onClick={async () => {
            const next = !showHomeAds;
            setShowHomeAds(next);
            await setDoc(doc(db, "config", "ads"), { showHomeAds: next }, { merge: true });
          }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fff", borderRadius: 12, border: "1.5px solid #EEF2F7", cursor: "pointer", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965" }}>首頁廣告</div>
              <div style={{ fontSize: 11, color: "#8896A6" }}>控制首頁是否顯示 AdSense 廣告</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: showHomeAds ? "#2D8A5E" : "#DDE4EC", position: "relative", transition: "background 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: showHomeAds ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>💰 小費設定</h4>
          <div style={{ fontSize: 13, color: "#5A7184", marginBottom: 8 }}>可設定小費的類別：</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => {
                setRewardCats(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]);
                setRewardDirty(true);
              }} style={{ padding: "6px 12px", borderRadius: 20, border: rewardCats.includes(c.id) ? "2px solid #2D8A5E" : "2px solid #DDE4EC", background: rewardCats.includes(c.id) ? "#2D8A5E14" : "#fff", color: rewardCats.includes(c.id) ? "#2D8A5E" : "#8896A6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {c.icon} {catLabel(c)} {rewardCats.includes(c.id) ? "✓" : ""}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#5A7184", marginBottom: 8 }}>發文類型：</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { id: "type_lost", label: "😰 我遺失了", color: "#1B4965" },
              { id: "type_found", label: "🔍 我撿到了", color: "#2D8A5E" },
              { id: "pet_lost", label: "🐾 我的寵物走失了", color: "#C2185B" },
              { id: "pet_found", label: "🐾 我發現走失寵物", color: "#7B4BB2" },
            ].map(t2 => (
              <button key={t2.id} onClick={() => {
                setRewardCats(prev => prev.includes(t2.id) ? prev.filter(x => x !== t2.id) : [...prev, t2.id]);
                setRewardDirty(true);
              }} style={{ padding: "6px 12px", borderRadius: 20, border: rewardCats.includes(t2.id) ? "2px solid " + t2.color : "2px solid #DDE4EC", background: rewardCats.includes(t2.id) ? t2.color + "14" : "#fff", color: rewardCats.includes(t2.id) ? t2.color : "#8896A6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t2.label} {rewardCats.includes(t2.id) ? "✓" : ""}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#5A7184", marginBottom: 8 }}>快速選擇金額：</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {rewardAmounts.map((amt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F7F9FC", borderRadius: 8, padding: "4px 8px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1B4965" }}>NT$ {amt}</span>
                <button onClick={() => { setRewardAmounts(prev => prev.filter((_, j) => j !== i)); setRewardDirty(true); }} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input id="newRewardAmt" type="number" placeholder="新增金額" style={{ ...S.input, flex: 1, fontSize: 13, padding: "8px 12px" }} />
            <button onClick={() => {
              const input = document.getElementById("newRewardAmt");
              const val = parseInt(input.value);
              if (!val || val <= 0) return;
              setRewardAmounts(prev => [...prev, val].sort((a, b) => a - b));
              setRewardDirty(true);
              input.value = "";
            }} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>新增</button>
          </div>
          <button onClick={async () => {
            try {
              await setDoc(doc(db, "config", "rewards"), { amounts: rewardAmounts, enabledCats: rewardCats }, { merge: true });
              setRewardDirty(false);
              alert("💰 小費設定已儲存！");
            } catch(e) { alert("儲存失敗"); }
          }} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: rewardDirty ? "linear-gradient(135deg, #E05A33, #D4880F)" : "linear-gradient(135deg, #2D8A5E, #28A06E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", animation: rewardDirty ? "pulse 1.5s infinite" : "none" }}>{rewardDirty ? "⚠️ 有未儲存的變更 — 點此儲存" : "💾 儲存小費設定"}</button>

          {/* API Stats */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>📊 平台數據</h4>
          <div style={{ padding: "10px 12px", background: posts.filter(p => !p.hidden).length > 400 ? "#FFF0F0" : "#F0FFF4", borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: posts.filter(p => !p.hidden).length > 400 ? "#E05A33" : "#2D8A5E" }}>
              {posts.filter(p => !p.hidden).length > 400 ? "⚠️ 接近免費額度上限，建議升級 Firebase Blaze" : "✅ 免費額度充裕"}
            </span>
            <span style={{ color: "#8896A6" }}> · 預估可承受 ~1,000 人/天</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1B4965" }}>{posts.filter(p => !p.hidden).length}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>總貼文</div>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#E05A33" }}>{posts.filter(p => !p.hidden && !p.resolved).length}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>尋找中</div>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#2D8A5E" }}>{posts.filter(p => p.resolved).length}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>已尋回</div>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#D4880F" }}>{posts.filter(p => !p.hidden).length > 0 ? Math.round(posts.filter(p => p.resolved).length / posts.filter(p => !p.hidden).length * 100) : 0}%</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>尋回率</div>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#D4880F" }}>NT${posts.filter(p => !p.resolved && p.reward > 0).reduce((s, p) => s + (p.reward || 0), 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>感謝金</div>
            </div>
            <div style={{ background: "#F7F9FC", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#2D8A5E" }}>NT${(posts.filter(p => p.resolved && p.reward > 0).reduce((s, p) => s + (p.reward || 0), 0) + savedClaimedReward).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#5A7184" }}>已領感謝金</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#8896A6", marginBottom: 4 }}>📡 API 端點：</div>
          <div style={{ background: "#1B2B3C", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#A8D0E6", fontFamily: "monospace", wordBreak: "break-all" }}>
            /api/v1/stats?key=YOUR_KEY<br/>
            /api/v1/posts?key=YOUR_KEY&airport=TPE
          </div>
          <a href="/api-docs.html" target="_blank" rel="noopener" style={{ display: "block", textAlign: "center", padding: "8px", background: "#1B4965", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📄 API 文件（開新分頁）</a>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>🔧 管理工具</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={exportCSV} style={{ ...S.filterChip, background: "#1B4965", color: "#fff", border: "none" }}>📥 匯出 CSV</button>
            <button onClick={loadAdminLogs} style={{ ...S.filterChip, background: "#D4880F", color: "#fff", border: "none" }}>📋 操作日誌</button>
            <button onClick={async () => {
              const snap = await getDocs(query(collection(db, "contactMessages"), orderBy("createdAt", "desc")));
              setContactMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
              setShowContactMsgs(true);
            }} style={{ ...S.filterChip, background: "#2D8A5E", color: "#fff", border: "none" }}>📬 用戶留言</button>
            <button onClick={() => setShowPostGuide(true)} style={{ ...S.filterChip, background: "#E05A33", color: "#fff", border: "none" }}>📝 預覽發文教學</button>
            <button onClick={() => { setShowTutorialVideo(true); setTutorialStep(0); setShowDashboard(false); }} style={{ ...S.filterChip, background: "#7B4BB2", color: "#fff", border: "none" }}>📱 預覽歡迎頁</button>
            <button onClick={() => {
              const testRoomId = "test_chat_" + user.uid;
              setChatRoomId(testRoomId);
              setChatTarget({ uid: "test_bot", name: "🤖 測試機器人", avatar: null });
              currentChatRoomRef.current = testRoomId;
              setActiveChats(prev => {
                if (prev.some(c => c.roomId === testRoomId)) return prev;
                return [...prev, { roomId: testRoomId, postId: "test", targetUid: "test_bot", targetName: "🤖 測試機器人", targetAvatar: null, lastMsg: "", unread: 0, msgCount: 0 }];
              });
              setShowDashboard(false);
              setView("chat");
            }} style={{ ...S.filterChip, background: "#00838F", color: "#fff", border: "none" }}>🧪 測試聊天室</button>
            <button onClick={async () => {
              const testData = [
                { cat: "lost", title: "黑色 Rimowa 行李箱 28吋", desc: "行李箱外觀為黑色，有綠色束帶。行李條號碼尾數 4821。", airport: "桃園國際機場 (TPE)", lat: 25.0797, lng: 121.2342 },
                { cat: "wrong", title: "拿錯銀色 Samsonite 行李箱", desc: "在第二航廈轉盤 B5 拿到一個銀色 Samsonite 行李箱，不是我的。", airport: "桃園國際機場 (TPE)", lat: 25.0797, lng: 121.2342 },
                { cat: "found", title: "撿到一個棕色皮夾", desc: "在台北車站大廳撿到一個棕色皮夾，內有證件。", loc: "台北車站", lat: 25.0478, lng: 121.5170 },
                { cat: "seeking", title: "尋找遺失的黑色 iPhone 15", desc: "昨天下午在信義區 ATT 4 FUN 遺失黑色 iPhone 15 Pro。", loc: "台北·信義區", lat: 25.0330, lng: 121.5654 },
                { cat: "wallet", title: "遺失粉紅色長夾", desc: "在新光三越 A11 美食街遺失粉紅色 Kate Spade 長夾。", loc: "台北·信義區", lat: 25.0360, lng: 121.5670 },
                { cat: "id_doc", title: "撿到身分證和健保卡", desc: "在板橋捷運站出口撿到一張身分證和健保卡。", loc: "新北·板橋", lat: 25.0145, lng: 121.4627 },
                { cat: "electronics", title: "遺失 AirPods Pro", desc: "黑色充電盒，在捷運忠孝復興站遺失。", loc: "台北·大安區", lat: 25.0418, lng: 121.5440 },
                { cat: "keys", title: "遺失一串鑰匙（附藍色悠遊卡）", desc: "鑰匙圈上有 3 把鑰匙和一張藍色悠遊卡。", loc: "台北·中山區", lat: 25.0525, lng: 121.5205 },
                { cat: "pet_dog", title: "柴犬走失 - 小黃", desc: "3歲公柴犬，戴紅色項圈，名字叫小黃。昨晚從家裡跑出去。", loc: "新北·永和", lat: 25.0090, lng: 121.5150 },
                { cat: "pet_cat", title: "橘白色貓咪走失", desc: "2歲母貓，橘白花色，非常親人。有結紮耳剪。", loc: "台北·大安區", lat: 25.0260, lng: 121.5430 },
                { cat: "pet_bird", title: "綠色虎皮鸚鵡飛走", desc: "會說「你好」，翅膀沒有剪，從陽台飛出去。", loc: "桃園·中壢", lat: 24.9537, lng: 121.2256 },
              ];
              const pick = testData[Math.floor(Math.random() * testData.length)];
              const types = ["lost", "found"];
              const postType = pick.cat === "found" ? "found" : types[Math.floor(Math.random() * 2)];
              const today = new Date();
              const daysAgo = Math.floor(Math.random() * 5);
              const postDate = new Date(today - daysAgo * 86400000);
              const dateStr = postDate.toISOString().split("T")[0];
              const reward = Math.random() > 0.6 ? [500, 1000, 2000, 3000][Math.floor(Math.random() * 4)] : 0;
              await addDoc(collection(db, "posts"), {
                category: pick.cat, title: pick.title, desc: pick.desc,
                airport: pick.airport || "", locationText: pick.loc || "",
                location: pick.lat ? { lat: pick.lat, lng: pick.lng } : null,
                date: dateStr, postType, reward,
                authorUid: user.uid, authorName: user.name, authorAvatar: user.avatar || null,
                resolved: false, hidden: false, pinned: false,
                photos: [], createdAt: serverTimestamp(),
                verifyQuestions: [{ q: "測試驗證題", a: "test" }],
                contact: "test@whatsfind.app", contactType: "email",
              });
              alert("✅ 已產生隨機測試貼文：\n\n「" + pick.title + "」");
            }} style={{ ...S.filterChip, background: "#7B4BB2", color: "#fff", border: "none" }}>🧪 隨機貼文</button>
          </div>

          {/* Contact messages */}
          {showContactMsgs && (
            <div style={{ marginTop: 12, maxHeight: 250, overflowY: "auto" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📬 用戶留言 ({contactMsgs.length})</h4>
              {contactMsgs.length === 0 && <p style={{ fontSize: 13, color: "#8896A6" }}>目前沒有留言</p>}
              {contactMsgs.map(m => (
                <div key={m.id} style={{ padding: "10px 12px", background: m.read ? "#F7F9FC" : "#EBF5FB", borderRadius: 10, marginBottom: 8, borderLeft: m.read ? "3px solid #DDE4EC" : "3px solid #1B4965" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4965" }}>{m.name}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#8896A6" }}>{m.createdAt?.toDate?.()?.toLocaleString("zh-TW") || ""}</span>
                      {!m.read && <button onClick={async () => { await updateDoc(doc(db, "contactMessages", m.id), { read: true }); setContactMsgs(prev => prev.map(c => c.id === m.id ? { ...c, read: true } : c)); }} style={{ ...S.miniBtn, background: "#1B4965", color: "#fff", fontSize: 11, padding: "3px 8px" }}>已讀</button>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#8896A6", marginBottom: 4 }}>{m.email}</div>
                  <div style={{ fontSize: 13, color: "#2C3E50", lineHeight: 1.5 }}>{m.message}</div>
                </div>
              ))}
            </div>
          )}

          {/* Audit log */}
          {showAdminLogs && (
            <div style={{ marginTop: 12, maxHeight: 200, overflowY: "auto" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1B4965", marginBottom: 8 }}>📋 最近操作</h4>
              {adminLogs.slice(0, 20).map(log => (
                <div key={log.id} style={{ padding: "6px 10px", background: "#F7F9FC", borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: "#1B4965" }}>{log.adminName}</span>
                  <span style={{ color: "#8896A6" }}> · {log.action} · </span>
                  <span style={{ color: "#5A7184" }}>{log.details?.postTitle || log.details?.targetName || ""}</span>
                  <span style={{ color: "#B0BEC5", marginLeft: 4 }}>{log.createdAt?.toDate?.()?.toLocaleString("zh-TW") || ""}</span>
                </div>
              ))}
            </div>
          )}

          {/* ─── Admin Management ─── */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>👑 管理員管理</h4>
          <p style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>輸入用戶 UID 加入或移除管理員權限</p>
          <div style={{ marginBottom: 8 }}>
            {ADMIN_UIDS.map(uid => (
              <div key={uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#F7F9FC", borderRadius: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#1B4965", fontWeight: 600 }}>{uid.slice(0, 12)}⋯ {ADMIN_UIDS_LIST.includes(uid) ? "(主管理員)" : ""}</span>
                {!ADMIN_UIDS_LIST.includes(uid) && <button onClick={async () => {
                  const updated = dynamicAdmins.filter(u => u !== uid);
                  await setDoc(doc(db, "config", "admins"), { list: updated });
                  logAdminAction("移除管理員", uid);
                }} style={{ background: "none", border: "none", color: "#E05A33", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>移除</button>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="newAdminUid" placeholder="輸入用戶 UID" style={{ ...S.input, flex: 1, fontSize: 13, padding: "8px 12px" }} />
            <button onClick={async () => {
              const uid = document.getElementById("newAdminUid").value.trim();
              if (!uid) return;
              if (ADMIN_UIDS.includes(uid)) { alert("此用戶已是管理員"); return; }
              const updated = [...dynamicAdmins, uid];
              await setDoc(doc(db, "config", "admins"), { list: updated });
              logAdminAction("新增管理員", uid);
              document.getElementById("newAdminUid").value = "";
              alert("已新增管理員！");
            }} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>新增</button>
          </div>

          {/* ─── Pin Reward ─── */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>📌 置頂獎勵管理</h4>
          <p style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>輸入用戶 UID 直接給予免費置頂次數</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input id="pinRewardUid" placeholder="用戶 UID" style={{ ...S.input, flex: 2, fontSize: 13, padding: "8px 12px" }} />
            <input id="pinRewardCount" placeholder="次數" type="number" defaultValue="1" min="1" max="10" style={{ ...S.input, flex: 1, fontSize: 13, padding: "8px 12px" }} />
            <button onClick={async () => {
              const uid = document.getElementById("pinRewardUid").value.trim();
              const count = parseInt(document.getElementById("pinRewardCount").value) || 1;
              if (!uid) return;
              try {
                // Ensure doc exists first
                const rDoc = await getDoc(doc(db, "referrals", uid));
                if (!rDoc.exists()) {
                  await setDoc(doc(db, "referrals", uid), { code: uid.substring(0, 8).toUpperCase(), count: count, referredBy: null });
                } else {
                  await updateDoc(doc(db, "referrals", uid), { count: increment(count) });
                }
                const updated = await getDoc(doc(db, "referrals", uid));
                const total = updated.exists() ? (updated.data().count || 0) : count;
                logAdminAction("給予置頂獎勵", uid + " +" + count + "次");
                document.getElementById("pinRewardUid").value = "";
                alert("已給予 " + count + " 次免費置頂！（目前共 " + total + " 次）");
              } catch(e) { alert("失敗：" + e.message); }
            }} style={{ ...S.sendBtn, fontSize: 13, padding: "8px 14px" }}>給予</button>
          </div>

          {/* ─── Data Viewer ─── */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4965", margin: "16px 0 8px" }}>📂 資料瀏覽器</h4>
          <p style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>直接查看 Firestore 各集合資料</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {["posts", "ratings", "reports", "referrals", "announcements", "adminLogs", "contactMessages", "config", "stats"].map(col => (
              <button key={col} onClick={async () => {
                try {
                  setDataViewerCol(col);
                  setDataViewerDoc(null);
                  setDataViewerDocs(null);
                  if (["config", "stats"].includes(col)) {
                    const knownDocs = col === "config" ? ["categories", "rewards", "verifyHints", "autoReply", "admins", "blockedUsers"] : ["claimedRewards", "global"];
                    const results = [];
                    for (const docId of knownDocs) {
                      try {
                        const snap = await getDoc(doc(db, col, docId));
                        if (snap.exists()) results.push({ id: snap.id, ...snap.data() });
                      } catch(e) {}
                    }
                    setDataViewerDocs(results);
                  } else {
                    try {
                      const snap = await getDocs(query(collection(db, col), orderBy("createdAt", "desc")));
                      setDataViewerDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    } catch(e) {
                      const snap = await getDocs(collection(db, col));
                      setDataViewerDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    }
                  }
                } catch(e) {
                  setDataViewerDocs([]);
                  alert("讀取失敗：" + e.message);
                }
              }} style={{ padding: "6px 12px", borderRadius: 8, border: dataViewerCol === col ? "2px solid #1B4965" : "1px solid #DDE4EC", background: dataViewerCol === col ? "#1B496510" : "#fff", fontSize: 12, fontWeight: 600, color: "#1B4965", cursor: "pointer" }}>{col}</button>
            ))}
          </div>
          {dataViewerCol && !dataViewerDocs && (
            <div style={{ textAlign: "center", padding: 20, color: "#8896A6" }}>⏳ 載入中⋯</div>
          )}
          {dataViewerCol && dataViewerDocs && (
            <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12, maxHeight: 300, overflowY: "auto" }}>
              <div style={{ fontSize: 12, color: "#8896A6", marginBottom: 8 }}>📄 {dataViewerCol} — {dataViewerDocs.length} 筆</div>
              {dataViewerDoc ? (
                <div>
                  <button onClick={() => setDataViewerDoc(null)} style={{ background: "none", border: "none", color: "#1B4965", fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 8 }}>← 返回列表</button>
                  <pre style={{ fontSize: 11, color: "#2C3E50", whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#fff", padding: 10, borderRadius: 8, maxHeight: 220, overflowY: "auto", lineHeight: 1.6 }}>{JSON.stringify(dataViewerDoc, (key, val) => {
                    if (val && val.toDate) return val.toDate().toLocaleString("zh-TW");
                    if (val && val.seconds) return new Date(val.seconds * 1000).toLocaleString("zh-TW");
                    return val;
                  }, 2)}</pre>
                </div>
              ) : (
                dataViewerDocs.length === 0 ? <div style={{ fontSize: 13, color: "#8896A6", textAlign: "center", padding: 16 }}>此集合沒有資料</div> :
                dataViewerDocs.map(d => (
                  <div key={d.id} onClick={() => setDataViewerDoc(d)} style={{ padding: "8px 10px", background: "#fff", borderRadius: 8, marginBottom: 4, cursor: "pointer", fontSize: 12, color: "#1B4965", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title || d.text || d.code || d.action || d.reason || d.id}</span>
                    <span style={{ fontSize: 11, color: "#8896A6", flexShrink: 0, marginLeft: 8 }}>{d.createdAt?.toDate?.()?.toLocaleDateString("zh-TW") || ""}</span>
                  </div>
                ))
              )}
            </div>
          )}

          <button onClick={() => setShowDashboard(false)} style={{ ...S.modalPrimaryBtn, marginTop: 16 }}>{t.close}</button>
        </div></div>
      )}

      {/* Admin Category Editor */}
      {showCatEditor && (
        <div style={S.modalOverlay}>
          <div style={{ ...S.modalCard, maxHeight: "85vh", overflowY: "auto", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#1B4965", fontSize: 18, fontWeight: 800 }}>⚙️ 管理類別</h3>
              <button onClick={() => setShowCatEditor(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8896A6" }}>✕</button>
            </div>
            {/* Mode tabs */}
            <div style={{ display: "flex", background: "#EEF2F7", borderRadius: 10, padding: 3, marginBottom: 14 }}>
              <button onClick={() => setCatEditorMode("item")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: (catEditorMode || "item") === "item" ? "#fff" : "transparent", color: (catEditorMode || "item") === "item" ? "#1B4965" : "#8896A6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{ t.itemMode }</button>
              <button onClick={() => setCatEditorMode("pet")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: catEditorMode === "pet" ? "#fff" : "transparent", color: catEditorMode === "pet" ? "#7B4BB2" : "#8896A6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{ t.petMode }</button>
            </div>
            {/* Category list */}
            {editCats.filter(c => (catEditorMode || "item") === "pet" ? PET_CATS.includes(c.id) || c.id?.startsWith("pet_") : !PET_CATS.includes(c.id) && !c.id?.startsWith("pet_")).map((c) => {
              const realIdx = editCats.indexOf(c);
              const isEditing = editingCatIdx === realIdx;
              return (
              <div key={c.id} style={{ borderRadius: 12, marginBottom: 8, overflow: "hidden", border: isEditing ? "2px solid " + c.color : "1px solid #EEF2F7" }}>
                {/* Preview row */}
                <div onClick={() => setEditingCatIdx(isEditing ? null : realIdx)} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: isEditing ? c.color + "08" : "#fff", cursor: "pointer", gap: 10 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4965" }}>{c.labels?.zh || catLabel(c)}</div>
                    <div style={{ fontSize: 11, color: "#8896A6" }}>ID: {c.id} {(catEditorMode || "item") === "item" && (["lost", "wrong"].includes(c.id) ? "· ✈️ 機場" : "· 🔍 一般")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                    {realIdx > 0 && <button onClick={e => { e.stopPropagation(); setEditCats(prev => { const n = [...prev]; [n[realIdx-1], n[realIdx]] = [n[realIdx], n[realIdx-1]]; return n; }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#5A7184", padding: 2 }}>⬆</button>}
                    {realIdx < editCats.length - 1 && <button onClick={e => { e.stopPropagation(); setEditCats(prev => { const n = [...prev]; [n[realIdx], n[realIdx+1]] = [n[realIdx+1], n[realIdx]]; return n; }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#5A7184", padding: 2 }}>⬇</button>}
                    <span style={{ fontSize: 12, color: "#8896A6" }}>{isEditing ? "▲" : "▼"}</span>
                  </div>
                </div>
                {/* Edit panel */}
                {isEditing && (
                  <div style={{ padding: "10px 12px", background: "#F7F9FC", borderTop: "1px solid #EEF2F7" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#5A7184", marginBottom: 6 }}>圖示</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                      {CATEGORY_ICONS.map(ic => (
                        <button key={ic} onClick={() => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, icon: ic } : cc))}
                          style={{ fontSize: 20, padding: 4, borderRadius: 6, border: c.icon === ic ? "2px solid " + c.color : "1px solid #DDE4EC", background: c.icon === ic ? c.color + "15" : "#fff", cursor: "pointer" }}>{ic}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#5A7184", marginBottom: 6 }}>顏色</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      {CATEGORY_COLORS.map(col => (
                        <button key={col} onClick={() => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, color: col } : cc))}
                          style={{ width: 32, height: 32, borderRadius: "50%", background: col, border: c.color === col ? "3px solid #1B4965" : "2px solid #EEF2F7", cursor: "pointer" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#5A7184", marginBottom: 6 }}>名稱（四語）</div>
                    <input value={c.labels?.zh || ""} onChange={e => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, labelKey: null, labels: { ...cc.labels, zh: e.target.value } } : cc))} placeholder="中文" style={{ ...S.input, marginBottom: 4, fontSize: 13, padding: "6px 10px" }} />
                    <input value={c.labels?.en || ""} onChange={e => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, labelKey: null, labels: { ...cc.labels, en: e.target.value } } : cc))} placeholder="English" style={{ ...S.input, marginBottom: 4, fontSize: 13, padding: "6px 10px" }} />
                    <input value={c.labels?.ja || ""} onChange={e => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, labelKey: null, labels: { ...cc.labels, ja: e.target.value } } : cc))} placeholder="日本語" style={{ ...S.input, marginBottom: 4, fontSize: 13, padding: "6px 10px" }} />
                    <input value={c.labels?.ko || ""} onChange={e => setEditCats(prev => prev.map((cc, j) => j === realIdx ? { ...cc, labelKey: null, labels: { ...cc.labels, ko: e.target.value } } : cc))} placeholder="한국어" style={{ ...S.input, fontSize: 13, padding: "6px 10px" }} />
                    {editCats.length > 1 && <button onClick={() => { setEditCats(prev => prev.filter((_, j) => j !== realIdx)); setEditingCatIdx(null); }} style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "#E05A33", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🗑️ 移除此類別</button>}
                  </div>
                )}
              </div>
            ); })}
            {editCats.length < 12 && <button onClick={addCategory} style={{ ...S.addQBtn, marginTop: 4 }}>＋ 新增類別</button>}
            <button onClick={saveCategories} style={{ ...S.modalPrimaryBtn, marginTop: 12 }}>💾 儲存</button>
            <button onClick={() => { setEditCats(DEFAULT_CATEGORIES.map(c => ({ ...c, labels: c.labels || { zh: T.zh[c.labelKey], en: T.en[c.labelKey], ja: T.ja[c.labelKey], ko: T.ko?.[c.labelKey] || "" } }))); setEditingCatIdx(null); }} style={S.modalSecondaryBtn}>🔄 恢復預設</button>
          </div>
        </div>
      )}

      {/* First-time posting guide */}
      {showPostGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => { setShowPostGuide(false); try { localStorage.setItem("lf_post_guide_seen", "1"); } catch(e) {} setView("post"); }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 360, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", fontSize: 48, marginBottom: 12 }}>📝</div>
            <h3 style={{ textAlign: "center", color: "#1B4965", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>發文前必看</h3>
            <div style={{ fontSize: 14, color: "#5A7184", lineHeight: 2 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 4 }}>步驟一：選擇分類</div>
                ✈️ 機場行李 或 🔍 一般尋找
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 4 }}>步驟二：填寫資訊</div>
                標題、描述、地點、日期、照片
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 4 }}>步驟三：設定驗證題</div>
                設定只有你能回答的問題，防止冒領
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1B4965", marginBottom: 4 }}>步驟四：填寫聯絡方式</div>
                LINE / Email / 電話（預設隱藏，通過驗證才可見）
              </div>
            </div>
            <div style={{ background: "#F0FFF4", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: "#2D8A5E", lineHeight: 1.8 }}>
              💡 描述越詳細、附上照片，找回機率越高！
            </div>
            <button onClick={() => { setShowPostGuide(false); try { localStorage.setItem("lf_post_guide_seen", "1"); } catch(e) {} setView("post"); }} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #E05A33, #D4880F)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>✍️ 我知道了，開始發文</button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {bottomNavBar}
      {installBanner}
      {shelterModal}
      {shelterDetailModal}
      {showMenu && <div onClick={() => setShowMenu(false)} style={S.overlay} />}
      {tutorialVideoModal}
      {postPopupModal}

    </div>
  );
}

const S = {
  root: { fontFamily: "'Noto Sans TC', -apple-system, sans-serif", background: "transparent", minHeight: "100vh", maxWidth: 720, margin: "0 auto", position: "relative", paddingBottom: "calc(160px + env(safe-area-inset-bottom, 0px))", overflowAnchor: "none" },
  header: { background: "linear-gradient(135deg, #1B4965 0%, #234E70 50%, #2D6E9E 100%)", padding: "16px 20px", paddingTop: "calc(16px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 20px rgba(27,73,101,0.25)", backdropFilter: "blur(10px)" },
  headerTitle: { color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: -0.3 },
  backBtn: { background: "none", border: "none", color: "#A8D0E6", fontSize: 15, cursor: "pointer", fontWeight: 600, padding: "4px 8px", borderRadius: 8 },
  loginHeaderBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 24, padding: "6px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" },
  avatarBtn: { background: "none", border: "2.5px solid rgba(255,255,255,0.5)", borderRadius: "50%", padding: 2, cursor: "pointer", display: "flex", transition: "border-color 0.2s" },
  dropdownMenu: { position: "absolute", right: 0, top: 46, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", width: 240, zIndex: 100, overflow: "hidden", animation: "scaleIn 0.2s ease" },
  menuItem: { display: "block", width: "100%", padding: "14px 20px", border: "none", background: "none", textAlign: "left", fontSize: 14, cursor: "pointer", color: "#E05A33", fontWeight: 600, borderTop: "1px solid #F7F9FC" },
  overlay: { position: "fixed", inset: 0, zIndex: 9 },
  searchBar: { padding: "14px 16px 6px" },
  searchInput: { width: "100%", padding: "12px 18px", borderRadius: 14, border: "2px solid #E8EDF2", fontSize: 15, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  filterRow: { display: "flex", gap: 8, padding: "8px 16px", overflowX: "auto", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" },
  filterChip: { border: "none", borderRadius: 24, padding: "8px 18px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 700, flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  feedList: { padding: "4px 16px", paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 },
  postCard: { background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: 18, boxShadow: "0 2px 12px rgba(27,73,101,0.08)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", animation: "fadeIn 0.3s ease", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.6)" },
  catBadge: { fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 10, display: "inline-block", letterSpacing: 0.3 },
  postTitle: { margin: "10px 0 4px", fontSize: 16, fontWeight: 800, letterSpacing: -0.3 },
  postDesc: { margin: 0, fontSize: 13, color: "#5A7184", lineHeight: 1.6 },
  postFooter: { display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid #EEF2F7" },
  fab: { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #E05A33, #D4880F)", color: "#fff", border: "none", borderRadius: 32, padding: "16px 36px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 24px rgba(224,90,51,0.4)", zIndex: 20, letterSpacing: 1, animation: "slideUp 0.4s ease" },
  detailCard: { background: "rgba(255,255,255,0.97)", margin: "16px auto", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(27,73,101,0.1)", maxWidth: 720, animation: "slideUp 0.3s ease", border: "1px solid rgba(255,255,255,0.6)" },
  detailTitle: { margin: "12px 0 8px", fontSize: 20, fontWeight: 800, color: "#1A2B3C", letterSpacing: -0.5 },
  detailMeta: { display: "flex", gap: 16, fontSize: 13, color: "#5A7184", marginBottom: 12 },
  detailDesc: { fontSize: 15, color: "#2C3E50", lineHeight: 1.8, margin: "0 0 16px", whiteSpace: "pre-wrap" },
  contactBox: { borderRadius: 14, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 6, fontSize: 14 },
  repliesSection: { padding: "0 16px 16px", maxWidth: 720, margin: "0 auto" },
  repliesTitle: { fontSize: 16, fontWeight: 800, color: "#1B4965", marginBottom: 12 },
  replyBubble: { background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", animation: "fadeIn 0.2s ease" },
  replyInputRow: { display: "flex", gap: 8, marginTop: 12 },
  replyInput: { flex: 1, padding: "12px 16px", borderRadius: 14, border: "2px solid #E8EDF2", fontSize: 14, outline: "none", background: "rgba(255,255,255,0.9)" },
  sendBtn: { background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", border: "none", borderRadius: 14, padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 2px 8px rgba(27,73,101,0.25)" },
  formWrap: { padding: 20, maxWidth: 640, margin: "0 auto" },
  label: { display: "block", fontSize: 13, fontWeight: 800, color: "#1B4965", marginBottom: 8, marginTop: 18, letterSpacing: 0.3 },
  input: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E8EDF2", fontSize: 15, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.95)" },
  select: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E8EDF2", fontSize: 15, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.95)", appearance: "auto" },
  textarea: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E8EDF2", fontSize: 15, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", background: "rgba(255,255,255,0.95)" },
  catGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 },
  catOption: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 14, border: "2.5px solid", cursor: "pointer", background: "#fff", transition: "transform 0.15s, box-shadow 0.15s" },
  submitBtn: { width: "100%", marginTop: 28, padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", border: "none", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(27,73,101,0.3)", letterSpacing: 0.5 },
  googleBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", padding: "14px 16px", borderRadius: 14, border: "2px solid #E8EDF2", background: "#fff", fontSize: 15, fontWeight: 700, color: "#2C3E50", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  spinner: { width: 44, height: 44, border: "4px solid #E8EDF2", borderTop: "4px solid #1B4965", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resolvedBadge: { fontSize: 12, fontWeight: 800, color: "#2D8A5E", background: "#2D8A5E14", padding: "5px 14px", borderRadius: 24 },
  resolveBtn: { width: "100%", marginTop: 16, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #2D8A5E, #28A06E)", color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,138,94,0.3)" },
  deleteBtn: { width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, background: "none", border: "2px solid #E05A33", color: "#E05A33", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  reportBtn: { width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, background: "none", border: "2px solid #B0BEC5", color: "#78909C", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  hiddenNotice: { marginTop: 12, padding: "14px", borderRadius: 14, background: "#FFF0F0", border: "1.5px solid #E05A33", fontSize: 13, color: "#E05A33", fontWeight: 700, textAlign: "center" },
  claimBtn: { width: "100%", marginTop: 12, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #D4880F, #E9A825)", color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(212,136,15,0.3)" },
  pendingNotice: { marginTop: 12, padding: "14px", borderRadius: 14, background: "#FFF8E1", border: "1.5px solid #D4880F", fontSize: 13, color: "#8B6914", fontWeight: 700, textAlign: "center" },
  claimCard: { background: "#F7F9FC", borderRadius: 14, padding: "14px 16px", marginBottom: 10, transition: "background 0.2s" },
  miniBtn: { padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  shieldBox: { background: "linear-gradient(135deg, #EBF5FF, #F0F7FF)", borderRadius: 14, padding: "14px 18px", marginTop: 12, border: "1.5px solid #B8D4F0" },
  warningBox: { display: "flex", alignItems: "center", gap: 10, background: "#FFF8E1", border: "1.5px solid #ECD06F", borderRadius: 14, padding: "12px 16px", marginBottom: 16 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease" },
  modalCard: { background: "#fff", borderRadius: 24, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", animation: "scaleIn 0.25s ease" },
  modalTitle: { textAlign: "center", color: "#1B4965", fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: -0.3 },
  modalDesc: { textAlign: "center", color: "#5A7184", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" },
  modalPrimaryBtn: { width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8, boxShadow: "0 4px 16px rgba(27,73,101,0.25)" },
  modalSecondaryBtn: { width: "100%", padding: "12px", borderRadius: 14, background: "none", color: "#8896A6", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600 },
  donateGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 },
  donateChip: { padding: "12px 4px", borderRadius: 12, border: "2.5px solid", fontSize: 14, fontWeight: 800, cursor: "pointer", background: "#fff", textAlign: "center", transition: "transform 0.15s" },
  customAmountWrap: { gridColumn: "1 / -1", display: "flex", alignItems: "center", border: "2.5px solid #E8EDF2", borderRadius: 12, padding: "10px 14px" },
  customAmountInput: { border: "none", outline: "none", fontSize: 15, fontWeight: 600, flex: 1, background: "transparent" },
  verifySection: { marginTop: 24, background: "linear-gradient(135deg, #FFF8F0, #FFF5EB)", borderRadius: 18, padding: 20, border: "2px solid #F0D9C0" },
  verifyQCard: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, border: "1.5px solid #EEF2F7", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" },
  hintChip: { background: "#fff", border: "2px solid #E8EDF2", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#1B4965", cursor: "pointer", fontWeight: 600, transition: "border-color 0.2s, background 0.2s" },
  addQBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "2.5px dashed #C8D3DE", background: "none", color: "#5A7184", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  statsBar: { display: "flex", justifyContent: "space-around", alignItems: "center", background: "rgba(255,255,255,0.9)", margin: "0 16px 10px", borderRadius: 16, padding: "14px 10px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", backdropFilter: "blur(4px)" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  footer: { margin: "24px 16px 0", paddingBottom: 24 },
  footerWarning: { background: "rgba(255,248,240,0.95)", border: "1.5px solid #F0D9C0", borderRadius: 16, padding: "16px 20px", marginBottom: 14 },
  footerWarningTitle: { margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#B8650A" },
  footerWarningText: { margin: 0, fontSize: 12, color: "#8B6914", lineHeight: 1.8 },
  footerCopyright: { textAlign: "center", padding: "20px 12px", fontSize: 12, color: "#8896A6" },
  footerLink: { fontSize: 12, color: "#1B4965", fontWeight: 700, cursor: "pointer", padding: "4px 8px", borderRadius: 6 },
  legalContent: { fontSize: 14, color: "#2C3E50", lineHeight: 1.8 },
  legalP: { margin: "0 0 14px", fontSize: 14, color: "#4A5568", lineHeight: 1.8 },
  contactItem: { display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: "#F7F9FC", borderRadius: 14, marginBottom: 10 },
  chatBody: { flex: 1, padding: 16, overflowY: "auto", minHeight: "calc(100vh - 130px)" },
  chatBubble: { padding: "12px 16px", display: "inline-block", maxWidth: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", animation: "fadeIn 0.2s ease" },
  chatInputBar: { position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", maxWidth: 960, margin: "0 auto", display: "flex", gap: 8, padding: "12px 16px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))", background: "#fff", borderTop: "1px solid #EEF2F7", boxSizing: "border-box", zIndex: 51 },
  chatInput: { flex: 1, padding: "12px 18px", borderRadius: 24, border: "2px solid #E8EDF2", fontSize: 15, outline: "none", background: "#F7F9FC" },
  chatSendBtn: { background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", border: "none", borderRadius: 24, padding: "12px 24px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(27,73,101,0.25)" },
  notifBadge: { position: "absolute", top: -4, right: -4, background: "#E05A33", color: "#fff", fontSize: 10, fontWeight: 800, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1s infinite" },
  notifPanel: { position: "fixed", top: 60, right: 16, width: 340, maxWidth: "calc(100vw - 32px)", background: "#fff", borderRadius: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", zIndex: 100, overflow: "hidden", animation: "scaleIn 0.2s ease" },
  notifItem: { display: "flex", gap: 14, padding: "14px 18px", borderBottom: "1px solid #F7F9FC", cursor: "pointer", alignItems: "flex-start", transition: "background 0.2s" },
  chatFab: { position: "fixed", bottom: 90, right: 20, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #1B4965, #2D6E9E)", border: "none", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 20px rgba(27,73,101,0.4)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", animation: "slideUp 0.4s ease" },
  chatFabBadge: { position: "absolute", top: -4, right: -4, background: "#E05A33", color: "#fff", fontSize: 11, fontWeight: 800, minWidth: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", animation: "pulse 1s infinite" },
  chatListPanel: { position: "fixed", bottom: 155, right: 20, width: 320, maxWidth: "calc(100vw - 40px)", background: "#fff", borderRadius: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", zIndex: 100, overflow: "hidden", maxHeight: 380, overflowY: "auto", animation: "scaleIn 0.2s ease" },
  chatListItem: { display: "flex", gap: 14, padding: "14px 18px", cursor: "pointer", alignItems: "center", borderBottom: "1px solid #F7F9FC", transition: "background 0.2s" },
  chatListBadge: { position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", background: "#E05A33", color: "#fff", fontSize: 13, fontWeight: 800, minWidth: 26, height: 26, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 7px", boxShadow: "0 1px 4px rgba(224,90,51,0.4)" },
  notifBanner: { display: "flex", alignItems: "center", gap: 14, margin: "14px 16px 0", padding: "14px 18px", background: "linear-gradient(135deg, #EBF5FB, #E3F0F9)", borderRadius: 16, border: "1.5px solid #B8D4F0", animation: "fadeIn 0.3s ease" },
  notifBannerBtn: { background: "linear-gradient(135deg, #1B4965, #2D6E9E)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(27,73,101,0.25)" },
  bottomNav: { position: "fixed", bottom: 20, left: 12, right: 12, width: "auto", maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-around", background: "rgba(27,73,101,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 18, padding: "2px 4px 2px", zIndex: 9999, boxShadow: "0 4px 20px rgba(27,73,101,0.25)" },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 12px" },
  navPostBtn: { width: 52, height: 52, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, marginTop: -20 },
};
