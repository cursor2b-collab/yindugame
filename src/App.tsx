import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Gift, Users, CreditCard, User, Menu, MessageSquare, ChevronLeft, ChevronRight, Share2, Facebook, MessageCircle, Instagram, Twitter, Copy, Info, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Sidebar } from './components/Sidebar';
import { useGameApi } from './hooks/useGameApi';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// --- Types ---
type Tab = 'home' | 'promo' | 'commission' | 'deposit' | 'profile';

// --- Components ---

const GameCard = ({ 
  title, 
  image, 
  vendorCode, 
  gameCode, 
  onClick 
}: { 
  title: string, 
  image: string,
  vendorCode?: string,
  gameCode?: string,
  onClick?: () => void
}) => (
  <div className="w-1/3 p-1 box-border cursor-pointer" onClick={onClick}>
    <div className="relative w-full pt-[150%] rounded-[5px] overflow-hidden hover:opacity-90 transition-opacity">
      <ImageWithFallback
        src={image}
        alt={title}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute top-1 right-1 w-6 h-6 z-10">
        <svg viewBox="0 0 24 24" fill="white" className="w-full h-full opacity-60 drop-shadow-sm">
          <path d="M12.001 4.529c-2.349-2.109-5.971-2.039-8.242.228-2.262 2.268-2.34 5.88-.236 8.236l.006.006 8.472 8.484 8.466-8.477c2.104-2.356 2.025-5.974-.236-8.236-2.271-2.267-5.893-2.337-8.23-0.241l-0.001 0.001z" />
        </svg>
      </div>
    </div>
    <div className="text-center text-white text-[11px] mt-1.5 truncate px-1">{title}</div>
  </div>
);

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Banner图片列表 - 从 public/image/banner 目录
  const bannerImages = [
    '/image/banner/9382fa6b9dd2aa1522a31bfe569ca5d9.jpg',
    '/image/banner/a6f59c67797c67044b1c3221b596cfe0.jpg',
    '/image/banner/afiliado_1.png',
    '/image/banner/ecf58c5cf896549de9a155c90c32e7eb.jpg'
  ];

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 4000); // 每4秒切换一次

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // 手动切换
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-900/20">
      {/* 轮播图片容器 */}
      <div className="relative w-full h-full">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <ImageWithFallback 
              src={image} 
              alt={`Banner ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* 文字覆盖层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent flex flex-col justify-center px-6 z-20">
        <div className="max-w-[60%]">
          <h2 className="text-amber-400 font-black text-xl leading-tight drop-shadow-md">OFERTA DE PRIMEIRO DEPÓSITO</h2>
          <p className="text-white text-xs mt-1 drop-shadow-md">GANHE UM BÔNUS NO SEU PRIMEIRO DEPÓSITO</p>
          <div className="text-4xl font-black text-red-500 mt-1 drop-shadow-md">100%</div>
        </div>
      </div>

      {/* 左右切换按钮 */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* 指示器点 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-amber-400 w-6' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryIcon = ({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center mr-[23px] flex-shrink-0 cursor-pointer ${active ? 'text-[#f6c343] font-bold' : 'text-[#999]'}`}
  >
    <div className={`w-[42px] h-[42px] rounded-[11px] border flex items-center justify-center box-border overflow-hidden ${active ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] scale-110 -translate-y-1' : 'border-[#84633c]'} transition-all duration-300`} style={{ backgroundImage: 'linear-gradient(135deg,#261b19,#382c2a)' }}>
      <img src={icon} alt={label} className="w-[30px] h-[30px] rounded-[8px] object-contain" />
    </div>
    <span className="text-[11px] mt-[3px] text-center whitespace-nowrap">{label}</span>
  </div>
);

const GameSection = ({ 
  id, 
  icon, 
  title, 
  count, 
  games, 
  vendorCode,
  onGameClick
}: { 
  id?: string, 
  icon: string, 
  title: string, 
  count: number, 
  games: { title: string, image: string, vendorCode?: string, gameCode?: string }[],
  vendorCode?: string,
  onGameClick?: (game: { title: string, image: string, vendorCode?: string, gameCode?: string }) => void
}) => {

  return (
    <div id={id} className="flex flex-col gap-4 scroll-mt-24">
      <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-[5px]">
        <div className="flex items-center gap-2">
          <img 
            src={icon} 
            alt={title} 
            className="w-10 h-10 rounded-[5px] object-contain"
          />
          <span className="text-[#efeaab] font-bold text-[17px] ml-1 mt-1">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="text-[19px] text-white/65 bg-white/10 rounded-[6px] px-2.5 py-1">{"<"}</button>
          <span className="text-[11px] text-white/65 bg-white/10 rounded-[6px] px-2.5 py-2.5 whitespace-nowrap"> Todos {count} </span>
          <button className="text-[19px] text-white/65 bg-white/10 rounded-[6px] px-2.5 py-1">{">"}</button>
          <button className="text-[11px] text-white/65 bg-white/10 rounded-[6px] px-2.5 py-2.5 font-bold">Mais</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-y-2 -mx-1">
        {games.map((game, idx) => (
          <GameCard 
            key={idx} 
            {...game} 
            vendorCode={game.vendorCode || vendorCode}
            onClick={() => onGameClick && onGameClick(game)}
          />
        ))}
      </div>
    </div>
  );
};

// --- Pages ---

// 供应商标签到供应商代码的映射
// 将旧平台代码映射到新接口的vendorCode（参考 tongmeng-main）
const mapApiCodeToVendorCode = (apiCode: string): string => {
  // 平台代码映射（旧接口 -> 新接口vendorCode）
  const vendorMapping: Record<string, string> = {
    'AG': 'casino-evolution',      // AG -> Evolution
    'BBIN': 'casino-evolution',     // BBIN -> Evolution
    'PT': 'slot-pragmatic',         // PT -> Pragmatic
    'PP': 'slot-pragmatic',         // PP -> Pragmatic Play
    'PRAGMATIC': 'slot-pragmatic',  // PRAGMATIC -> slot-pragmatic
    'CQ9': 'slot-cq9',              // CQ9
    'PG': 'slot-pgsoft',            // PG -> PGSoft
    'JDB': 'slot-jdb',              // JDB
    'WG': 'slot-wg',                // WG -> WG (Wazdan Games)
    'HACKSAW': 'slot-hacksaw',      // Hacksaw Gaming
    'TITAN': 'slot-titan',          // Titan Gaming
    'UPPERCUT': 'slot-uppercut',    // Uppercut Gaming
    'PETER': 'slot-peter',          // Peter & Sons
    'FC': 'slot-fachai',            // FC -> FaChai
    'FACHAI': 'slot-fachai',        // FACHAI -> slot-fachai
    'JILI': 'slot-jili',            // JILI
    'TADA': 'slot-tada',            // TADA
    'MG': 'slot-mg',                // MG -> Microgaming
    'EVO': 'casino-evolution',      // EVO -> Evolution
    'PL': 'casino-playace',         // PL -> PlayAce
    'SA': 'casino-sa',              // SA -> SA Gaming
  };
  
  const mapped = vendorMapping[apiCode.toUpperCase()];
  if (mapped) {
    return mapped;
  }
  
  // 如果没有映射，尝试转换为小写并添加前缀
  const lowerCode = apiCode.toLowerCase();
  console.warn(`⚠️ 平台代码 ${apiCode} 没有映射，使用默认格式: slot-${lowerCode}`);
  return `slot-${lowerCode}`;
};

// 旧平台代码映射（用于显示）
const vendorCodeMap: { [key: string]: string } = {
  "PG slots": "PG",
  "PP slots": "PP",
  "JILI": "JILI",
  "JDB": "JDB",
  "TADA": "TADA",
  "WG": "WG",
  "FaChai": "FC",
  "CP Game": "CPGAME",
  "Pescaria": "PESCARIA",
  "Cartas": "CARTAS",
  "Live": "LIVE",
  "Slots": "SLOTS",
  "Sports": "SPORTS"
};

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("PG slots");
  const [gamesData, setGamesData] = useState<{ [key: string]: { title: string, image: string, vendorCode?: string, gameCode?: string }[] }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [gameCounts, setGameCounts] = useState<{ [key: string]: number }>({});
  const { fetchGames: fetchGamesFromApi, launchGame } = useGameApi();

  // 格式化游戏数据（参考 stake-vue 和 tongmeng-main 的实现）
  const formatGameData = (game: any, vendorCode: string) => {
    // 确保vendorCode和gameCode是字符串且不为空
    let gameVendorCode = game.vendorCode || vendorCode || '';
    let gameCode = game.gameCode || game.code || game.game_code || '';
    
    // 转换为字符串并去除空格
    gameVendorCode = String(gameVendorCode).trim();
    gameCode = String(gameCode).trim();
    
    // 如果gameCode为空，尝试使用id或其他字段
    if (!gameCode) {
      if (game.id) {
        gameCode = String(game.id).trim();
      } else if (game.gameId) {
        gameCode = String(game.gameId).trim();
      } else if (game.game_id) {
        gameCode = String(game.game_id).trim();
      }
    }
    
    // 如果vendorCode或gameCode为空，记录警告
    if (!gameVendorCode || !gameCode) {
      console.warn('⚠️ 游戏数据缺少vendorCode或gameCode:', {
        vendorCode: gameVendorCode,
        gameCode,
        game,
        '原始数据': JSON.stringify(game, null, 2)
      });
    }
    
    // 提取游戏名称（优先使用英文名称）
    // 优先顺序：gameNameEn > nameEn > gameName > name > title > game_name > gameNameCn
    const gameName = game.gameNameEn || 
                    game.nameEn ||
                    game.gameName || 
                    game.name || 
                    game.title || 
                    game.game_name ||
                    game.gameNameCn ||
                    'Game';
    
    // 提取游戏logo/图片（优先使用英文版本的图片）
    // 优先顺序：thumbnailEn > imageUrlEn > imageEn > thumbnail > imageUrl > image > icon > logo > 其他字段
    const gameImage = game.thumbnailEn ||
                     game.imageUrlEn ||
                     game.imageEn ||
                     game.thumbnail || 
                     game.imageUrl || 
                     game.image || 
                     game.icon || 
                     game.logo ||
                     game.image_url ||
                     game.thumbnailUrl ||
                     game.thumbnail_url ||
                     game.picture ||
                     game.pic ||
                     game.img ||
                     "https://images.unsplash.com/photo-1769953556321-df370db9e674?w=400";
    
    console.log('📦 格式化游戏数据:', {
      '原始游戏': game,
      '提取的名称': gameName,
      '提取的图片': gameImage,
      'vendorCode': gameVendorCode,
      'gameCode': gameCode
    });
    
    return {
      title: gameName,
      image: gameImage,
      vendorCode: gameVendorCode,
      gameCode: gameCode
    };
  };

  // 获取游戏列表（使用 useCallback 优化，参考 tongmeng-main）
  const fetchGames = useCallback(async (vendorLabel: string) => {
    // 先获取旧平台代码
    const apiCode = vendorCodeMap[vendorLabel] || vendorLabel.toUpperCase();
    
    // 如果已经在加载或已有数据，跳过
    if (loading[vendorLabel] || gamesData[vendorLabel]) {
      return;
    }

    setLoading(prev => ({ ...prev, [vendorLabel]: true }));

    try {
      // 映射到新接口的vendorCode（参考 tongmeng-main）
      let vendorCode = mapApiCodeToVendorCode(apiCode);
      
      // 先尝试获取供应商列表，确认正确的vendorCode（参考 tongmeng-main）
      try {
        const { gameApiService } = await import('@/services/gameApiService');
        const vendorsResponse = await gameApiService.getVendorsList();
        if (vendorsResponse && vendorsResponse.success && vendorsResponse.message && Array.isArray(vendorsResponse.message)) {
          const vendorsResult = vendorsResponse.message;
          // 检查映射的vendorCode是否存在
          const foundVendor = vendorsResult.find((v: any) => v.vendorCode === vendorCode);
          if (!foundVendor) {
            console.warn(`⚠️ 映射的vendorCode "${vendorCode}" 不存在于供应商列表中`);
            // 尝试根据名称匹配
            const nameMatch = vendorsResult.find((v: any) => 
              v.name?.toLowerCase().includes(apiCode.toLowerCase()) ||
              v.vendorCode?.toLowerCase().includes(apiCode.toLowerCase())
            );
            if (nameMatch) {
              vendorCode = nameMatch.vendorCode;
              console.log(`✅ 找到匹配的供应商: ${vendorCode}`);
            } else {
              console.warn(`⚠️ 无法找到匹配的供应商，使用映射值: ${vendorCode}`);
            }
          } else {
            console.log(`✅ vendorCode "${vendorCode}" 存在于供应商列表中`);
          }
        }
      } catch (vendorError: any) {
        console.warn('⚠️ 获取供应商列表失败，使用映射值:', vendorError);
      }
      
      console.log(`📤 准备获取${vendorLabel}游戏列表，vendorCode: ${vendorCode} (原始: ${apiCode})`);
      
      // 强制使用英文语言获取游戏列表（确保返回英文名称和图片）
      // 传递 'en' 作为 language 参数，确保API返回英文数据
      const gamesResult = await fetchGamesFromApi(vendorCode, 'en');
      
      console.log(`📥 获取${vendorLabel}游戏列表响应:`, {
        vendorCode,
        gamesCount: gamesResult?.length || 0,
        games: gamesResult
      });
      
      if (gamesResult && Array.isArray(gamesResult) && gamesResult.length > 0) {
        const formattedGames = gamesResult.map((game: any) => formatGameData(game, vendorCode));
        
        console.log(`✅ 格式化后的${vendorLabel}游戏:`, formattedGames);
        
        setGamesData(prev => ({ ...prev, [vendorLabel]: formattedGames }));
        setGameCounts(prev => ({ ...prev, [vendorLabel]: formattedGames.length }));
      } else {
        // 如果API返回空数组或失败，使用默认数据（参考 stake-vue 的处理方式）
        console.log(`供应商 ${vendorCode} 暂无游戏数据，使用默认数据`);
        const defaultVendorCode = vendorCodeMap[vendorLabel] || vendorLabel.toUpperCase();
        const defaultGames = Array.from({ length: 12 }, (_, i) => ({
          title: `${vendorLabel} Game ${i + 1}`,
          image: `https://images.unsplash.com/photo-1769953556321-df370db9e674?w=400`,
          vendorCode: defaultVendorCode,
          gameCode: `GAME${i + 1}`
        }));
        setGamesData(prev => ({ ...prev, [vendorLabel]: defaultGames }));
        setGameCounts(prev => ({ ...prev, [vendorLabel]: 12 }));
      }
    } catch (error: any) {
      // 即使出错也使用默认数据，确保界面正常显示（参考 stake-vue 的错误处理）
      console.warn(`获取${vendorLabel}游戏列表失败，使用默认数据:`, error);
      const defaultVendorCode = vendorCodeMap[vendorLabel] || vendorLabel.toUpperCase();
      const defaultGames = Array.from({ length: 12 }, (_, i) => ({
        title: `${vendorLabel} Game ${i + 1}`,
        image: `https://images.unsplash.com/photo-1769953556321-df370db9e674?w=400`,
        vendorCode: defaultVendorCode,
        gameCode: `GAME${i + 1}`
      }));
      setGamesData(prev => ({ ...prev, [vendorLabel]: defaultGames }));
      setGameCounts(prev => ({ ...prev, [vendorLabel]: 12 }));
    } finally {
      setLoading(prev => ({ ...prev, [vendorLabel]: false }));
    }
  }, [fetchGamesFromApi, loading, gamesData]);

  // 处理游戏点击（参考 stake-vue 的 launchGame 实现）
  const handleGameClick = async (game: { title: string, image: string, vendorCode?: string, gameCode?: string }) => {
    try {
      // 确保vendorCode和gameCode是字符串且不为空（参考 stake-vue GameCard.vue）
      let gameVendorCode = String(game.vendorCode || vendorCodeMap[activeCategory] || 'PRAGMATIC').trim();
      let gameCodeValue = String(game.gameCode || game.title.replace(/\s+/g, '').toUpperCase()).trim();
      
      // 验证参数（参考 stake-vue）
      if (!gameVendorCode || gameVendorCode === 'null' || gameVendorCode === 'undefined') {
        console.warn('⚠️ 游戏缺少vendorCode:', game);
        alert('游戏数据不完整，无法启动');
        return;
      }
      
      if (!gameCodeValue || gameCodeValue === 'null' || gameCodeValue === 'undefined' || gameCodeValue === '0') {
        console.warn('⚠️ 游戏缺少gameCode:', game);
        alert('游戏数据不完整，无法启动');
        return;
      }
      
      console.log('🎮 点击游戏，准备启动:', {
        vendorCode: gameVendorCode,
        gameCode: gameCodeValue,
        language: '(将从localStorage自动获取)',
        name: game.title
      });
      
      // 使用 useGameApi hook 的 launchGame 方法
      // 不传递 language 参数，让 gameApiService 自动从 localStorage 获取并映射
      await launchGame(gameVendorCode, gameCodeValue, undefined, null);
      console.log('✅ 游戏启动成功');
    } catch (error: any) {
      console.error('❌ 启动游戏失败:', error);
      alert('启动游戏失败：' + (error.message || '请先登录或稍后重试'));
    }
  };

  // 组件加载时获取所有分类的游戏（参考 tongmeng-main）
  useEffect(() => {
    // 获取默认分类的游戏
    fetchGames("PG slots");
    // 同时获取其他主要分类的游戏（JILI, JDB, WG等）
    fetchGames("JILI");
    fetchGames("JDB");
    fetchGames("WG");
    fetchGames("PP slots");
    fetchGames("TADA");
    fetchGames("FaChai");
  }, [fetchGames]);

  // 当切换分类时获取对应游戏
  useEffect(() => {
    if (activeCategory && !gamesData[activeCategory]) {
      fetchGames(activeCategory);
    }
  }, [activeCategory, gamesData, fetchGames]);

  const generateGames = (count: number, vendorLabel: string = "Game") => {
    // 如果有真实数据，使用真实数据；否则生成默认数据
    if (gamesData[vendorLabel] && gamesData[vendorLabel].length > 0) {
      return gamesData[vendorLabel].slice(0, count);
    }
    
    const baseImages = [
      "https://images.unsplash.com/photo-1769953556321-df370db9e674?w=400",
      "https://images.unsplash.com/photo-1759950616527-15c2818f2f3c?w=400",
      "https://images.unsplash.com/photo-1643598772821-314261780e19?w=400",
      "https://images.unsplash.com/photo-1632849508137-3ef430962c8e?w=400",
      "https://images.unsplash.com/photo-1583346072154-b1c8fe8ba015?w=400",
      "https://images.unsplash.com/photo-1632849508137-3ef430962c8e?w=400"
    ];
    const vendorCode = vendorCodeMap[vendorLabel] || vendorLabel.toUpperCase();
    return Array.from({ length: count }, (_, i) => ({
      title: `${vendorLabel} Game ${i + 1}`,
      image: baseImages[i % baseImages.length],
      vendorCode: vendorCode,
      gameCode: `GAME${i + 1}`
    }));
  };

  const handleCategoryClick = (label: string) => {
    setActiveCategory(label);
    const element = document.getElementById(label);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Banner />
      
      {/* Marquee */}
      <div className="bg-[#242424] rounded-full h-[36px] px-3 flex items-center gap-2 overflow-hidden border border-white/5">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <img src="https://ik.imagekit.io/gpbvknoim/0091_xiaoxi_zi.png" alt="" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
          <div className="flex-1 overflow-hidden">
            <motion.div 
              animate={{ x: ["100%", "-200%"] }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="text-[12px] text-[#ccc] whitespace-nowrap"
            >
              ❤️ Damos as boas-vindas a todos os nossos valiosos usuários à plataforma de jogos PG7X7📍‼️  Por ocasião do nosso 2º aniversário, para retribuir o apoio dos jogadores, oferecemos recompensas generosas e promoções de recarga com super valor! Agradecemos pela confiança e apoio de todos. Desejamos a vocês um dia feliz!  🤝 Nossa plataforma conta com atendimento ao cliente online 24 horas por dia!
            </motion.div>
          </div>
        </div>
        <div className="flex-shrink-0 cursor-pointer ml-1">
          <img src="https://ik.imagekit.io/gpbvknoim/personal_mensagem.png" alt="" className="w-[28px] h-[28px] object-contain" />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center overflow-x-auto no-scrollbar px-2 py-2">
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20250726/f979ed32323c869f59c3e445e9927e5a.png" label="PG slots" active={activeCategory === "PG slots"} onClick={() => handleCategoryClick("PG slots")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20250726/484e4d9d502ed52f09c20672ce932510.png" label="PP slots" active={activeCategory === "PP slots"} onClick={() => handleCategoryClick("PP slots")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260113/15746b21d8e103dc83c7ef9483e38474.png" label="JILI" active={activeCategory === "JILI"} onClick={() => handleCategoryClick("JILI")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260112/bdb130e28d33dd7769e5ea6258c689a6.png" label="JDB" active={activeCategory === "JDB"} onClick={() => handleCategoryClick("JDB")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260112/e466c932272b69f0d0209b94c74d83a5.png" label="TADA" active={activeCategory === "TADA"} onClick={() => handleCategoryClick("TADA")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260112/02646e6ab19d0e978c6bb45b11125840.png" label="WG" active={activeCategory === "WG"} onClick={() => handleCategoryClick("WG")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260203/af7387c822fa39ab2f35c404dccc4ec5.png" label="FaChai" active={activeCategory === "FaChai"} onClick={() => handleCategoryClick("FaChai")} />
        <CategoryIcon icon="https://admin.pg7x7.com/uploads/20260203/68153d43d43b0cb2233776cb89dc487e.png" label="CP Game" active={activeCategory === "CP Game"} onClick={() => handleCategoryClick("CP Game")} />
        <CategoryIcon icon="https://image.pghermes7.com/uploads/20241219/3f04903a89066e78a13d8538a3ec35ef.png" label="Pescaria" active={activeCategory === "Pescaria"} onClick={() => handleCategoryClick("Pescaria")} />
        <CategoryIcon icon="https://image.pghermes7.com/uploads/20250511/bf15fea45cb3c666577eb2f0bcd15724.png" label="Cartas" active={activeCategory === "Cartas"} onClick={() => handleCategoryClick("Cartas")} />
        <CategoryIcon icon="https://image.pghermes7.com/uploads/20250511/a3947d90487d5a5accf7801c211fbe82.png" label="Live" active={activeCategory === "Live"} onClick={() => handleCategoryClick("Live")} />
        <CategoryIcon icon="https://image.pghermes7.com/uploads/20241219/3ac273c789e714e033a2a785b072ca7b.png" label="Slots" active={activeCategory === "Slots"} onClick={() => handleCategoryClick("Slots")} />
        <CategoryIcon icon="https://image.pghermes7.com/uploads/20250511/29e5c1e61fee0b1bcefe892a747b6047.png" label="Sports" active={activeCategory === "Sports"} onClick={() => handleCategoryClick("Sports")} />
      </div>

      <div className="flex flex-col gap-8 px-1">
        {/* PG Section */}
        <GameSection 
          id="PG slots"
          icon="https://admin.pg7x7.com/uploads/20250726/f979ed32323c869f59c3e445e9927e5a.png" 
          title="PG slots" 
          count={gameCounts["PG slots"] || 128} 
          games={generateGames(12, "PG slots")}
          vendorCode={vendorCodeMap["PG slots"]}
          onGameClick={handleGameClick}
        />

        {/* PP Section */}
        <GameSection 
          id="PP slots"
          icon="https://admin.pg7x7.com/uploads/20250726/484e4d9d502ed52f09c20672ce932510.png" 
          title="PP slots" 
          count={gameCounts["PP slots"] || 377} 
          games={generateGames(12, "PP slots")}
          vendorCode={vendorCodeMap["PP slots"]}
          onGameClick={handleGameClick}
        />

        {/* JILI Section */}
        <GameSection 
          id="JILI"
          icon="https://admin.pg7x7.com/uploads/20260113/15746b21d8e103dc83c7ef9483e38474.png" 
          title="JILI" 
          count={gameCounts["JILI"] || 66} 
          games={generateGames(12, "JILI")}
          vendorCode={vendorCodeMap["JILI"]}
          onGameClick={handleGameClick}
        />

        {/* JDB Section */}
        <GameSection 
          id="JDB"
          icon="https://admin.pg7x7.com/uploads/20260112/bdb130e28d33dd7769e5ea6258c689a6.png" 
          title="JDB" 
          count={gameCounts["JDB"] || 59} 
          games={generateGames(12, "JDB")}
          vendorCode={vendorCodeMap["JDB"]}
          onGameClick={handleGameClick}
        />

        {/* TADA Section */}
        <GameSection 
          id="TADA"
          icon="https://admin.pg7x7.com/uploads/20260112/e466c932272b69f0d0209b94c74d83a5.png" 
          title="TADA" 
          count={gameCounts["TADA"] || 74} 
          games={generateGames(12, "TADA")}
          vendorCode={vendorCodeMap["TADA"]}
          onGameClick={handleGameClick}
        />

        {/* WG Section */}
        <GameSection 
          id="WG"
          icon="https://admin.pg7x7.com/uploads/20260112/02646e6ab19d0e978c6bb45b11125840.png" 
          title="WG" 
          count={gameCounts["WG"] || 22} 
          games={generateGames(12, "WG")}
          vendorCode={vendorCodeMap["WG"]}
          onGameClick={handleGameClick}
        />

        {/* FaChai Section */}
        <GameSection 
          id="FaChai"
          icon="https://admin.pg7x7.com/uploads/20260203/af7387c822fa39ab2f35c404dccc4ec5.png" 
          title="FaChai" 
          count={gameCounts["FaChai"] || 36} 
          games={generateGames(12, "FaChai")}
          vendorCode={vendorCodeMap["FaChai"]}
          onGameClick={handleGameClick}
        />
      </div>

      {/* Footer - Partners Section */}
      <FooterSection />
    </div>
  );
};

const PromotionPage = () => {
  const promos = [
    { title: "Bônus de inscrição", status: "Em andamento", image: "https://admin.pg7x7.com/uploads/20250818/c0c8ee6abaf958fc6defd75b1c54c3bc.jpg", hasInfo: true },
    { title: "Bônus de primeiro depósito", status: "Em andamento", image: "https://admin.pg7x7.com/uploads/20250801/3257b929379c8eb6006160b11bc92bc0.jpg", hasInfo: true },
    { title: "Bônus de segundo depósito", status: "Verificar", image: "https://admin.pg7x7.com/uploads/20250804/b873a13455224a6108d5fca6fd716fbc.png", hasInfo: true },
    { title: "Convite de Amigos", status: "Verificar", image: "https://admin.pg7x7.com/uploads/20250801/3c539c6c5bf7c146c41cd19e08a58722.jpg", hasInfo: true },
    { title: "Recompensa VIP", status: "Em andamento", image: "https://admin.pg7x7.com/uploads/20250801/67a8c57af8f2f2e12c3c7a5019cbec0d.jpg", hasInfo: true },
    { title: "Resgate de Bônus", status: "Verificar", image: "https://admin.pg7x7.com/uploads/20250801/fda30b8f53c4cf1154b41fede9db6862.jpg", hasInfo: true },
    { title: "Evento de Recarga", status: "Em andamento", image: "https://admin.pg7x7.com/uploads/20250801/217739a06eb822da4fa249efbcfa8df7.jpg", hasInfo: true },
    { title: "Prêmio Diário", status: "Verificar", image: "https://admin.pg7x7.com/uploads/20250801/1183fa29b2f9088e0acae4d4eaebb394.jpg", hasInfo: true },
  ];

  return (
    <div className="flex flex-col gap-[10px] pb-24 mt-[10px]">
      {promos.map((promo, idx) => (
        <div key={idx} className="bg-[#242424] rounded-[10px] overflow-hidden flex flex-col">
          <div className="w-full h-[124px]">
            <ImageWithFallback 
              src={promo.image} 
              alt="Promotion" 
              className="w-full h-full object-fill" 
            />
          </div>
          {promo.hasInfo && (
            <div className="flex items-center justify-between p-[10px] bg-[#3a3026]">
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.pg7x7.com/static/images/event/global_wash_chip.png" 
                  alt="Icon" 
                  className="w-5 h-5 object-contain"
                />
                <span className="text-[14px] text-white font-medium">{promo.title}</span>
              </div>
              <div className="right">
                <button 
                  className="bg-[linear-gradient(180deg,#fdffab,#d0a138_52%,#eed562)] shadow-[inset_0_-3px_0_0_#c5962e] text-black font-bold px-[10px] rounded-[12px] text-[12px] h-[37px] flex items-center justify-center active:scale-95 transition-transform"
                >
                  {promo.status}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CommissionPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('Convite');
  const tabs = ['Convite', 'Os meus dados', 'Comissão', 'Detalhado', 'FAQ'];

  return (
    <div className="flex flex-col gap-6 pb-24 -mx-4">
      {/* Top Banner with Tabs */}
      <div 
        className="h-[173px] w-full relative flex flex-col justify-end"
        style={{
          backgroundImage: "url('https://www.pg7x7.com/static/images/convidar/afiliado_1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Tabs Scroll Area */}
        <div className="absolute bottom-0 w-full px-[10px] bg-[rgba(3,11,32,0.5)] backdrop-blur-[8px] border-b-[1.5px] border-[#dbb65c]">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-6 whitespace-nowrap py-3">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`text-[14px] font-bold cursor-pointer transition-all relative ${
                    activeSubTab === tab 
                    ? 'text-[#dbb65c]' 
                    : 'text-white/70'
                  }`}
                >
                  {tab}
                  {activeSubTab === tab && (
                    <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#dbb65c]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* My Link */}
      <div 
        className="w-full p-2.5 rounded-lg mb-2.5 flex flex-col justify-center box-border"
        style={{
          backgroundImage: "url('https://www.pg7x7.com/static/images/convidar/afiliado_2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-white text-[14px] mb-2 font-medium">Meu link:</div>
        <div className="bg-black/40 rounded-lg flex items-center p-1 border border-white/10 mb-4">
          <span className="flex-1 px-3 text-[12px] text-white/80 truncate font-bold">https://www.pg7x7.com/#/?pid=</span>
          <button className="bg-[linear-gradient(180deg,#fdffab,#d0a138_52%,#eed562)] px-4 h-[32px] rounded-md text-[12px] font-bold text-black active:scale-95 transition-transform">Cópia</button>
        </div>
        
        <p className="text-white text-[12px] mb-3 font-medium">Compartilhamento Rápido</p>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 pb-2">
            {[
              { img: 'https://www.pg7x7.com/static/images/convidar/home_share_share.png', label: 'Mais' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0077_facebook_cai.svg', label: 'facebook' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0075_Whatsapp_cai.svg', label: 'whatsapp' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0077_Telegram_cai.svg', label: 'telegram' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0076_insgram_cai.svg', label: 'instagram' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0084_twitter_cai.svg', label: 'twitter' },
              { img: 'https://www.pg7x7.com/static/images/convidar/0084_kwai_cai.svg', label: 'kwai' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[60px]">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={s.img} alt={s.label} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-white/70 capitalize">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hierarchy Info */}
      <div className="bg-[#453a31] rounded-2xl flex flex-col items-center gap-4 p-4">
        <h4 className="text-white text-[14px] font-bold text-center">Desenvolvimento e recompensas para os subordinados</h4>
        <div className="w-full">
          <img 
            src="https://www.pg7x7.com/static/images/convidar/afiliado_3_2.png" 
            alt="Referral Info" 
            className="w-full h-auto object-contain"
            style={{ height: '336.75px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 mx-[10px] bg-white/5 rounded-[8px] p-[10px] flex flex-col gap-4">
        <div className="bg-[linear-gradient(115deg,#dbb65c,#fdffab_52%,#dbb65c)] p-2 rounded-[6px] text-black font-bold flex items-center mb-[10px] gap-2">
           <div className="w-6 h-6">
             <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAxlBMVEUAAAAAleUAl+wGn+YDj+X////E5fv////+//9zvfL///+m1/X////8/f/7/P7z+/7////////1+/7V7Py53/n////////////o9P673/mNyPH////////9///5/f/v+P3h8/z9///4/P/2+v/x+f7s9/7j9f39///7/v/u9/3////3+/7g8/3a7vvO6Pn6/f/5/P/9///8/v/8/f/8/f/1+//v+P7////////7/v/8/f/6/f/x+f/2+//y+v7p9f38/v/////NqwVmAAAAQXRSTlMABAYICf0d+s8K9BHlpZBj9+9nJhve2so7Fg/p57SBUDS9hWxTSDe4lkPUcy4pI5OIxK6inlxL6+KajHxWd2FBqtDYMCoAAAbqSURBVGje7ZppY9owDIZHHAIhhXIWApT7KlAoPVivtc3//1MbfmXHdnOxfZ0+beGVHkuxpSTbj3jLCfsHSbonWXbN+eHJMmuyh7fIIr0NzTkI1VP3z6rJHt70ziZKtNDTvaksi/1Cbz0e3HThrANOksF43Sv0i8vKjRsiMsXflmtBaLVKA76qqlHRJOVtBoIIv3vIB7rlH334ivj+4zfJw04g0uJfVoPv1j+CgPjHfoSkeplCQHy3EkTahRcCvItoTcUFISkBdh3E2E1O2k2c5pohhYQCVWTC1/WF03UWmyWWm2+EgEYeSS03XFK/rsoc4ouE+HUSFlYOg1nWO1xzimEZ75ZFImdVIMc6CHEJ7GgprRGCw57aP9v1nGb1P5ee8CsgoxYlvkMKMQk8QNVuIrxiOcNwVUE02/B9gDg6gVEe63f08HBJQzjIIT+COjKBR0g6Mn4ug0lCB8t7hF8UgPW4oizi5zKaIJS5e4/FAmh73yJ+7gwD4ZYOTAQAmjv+exEJxFY8Eo4UijzAHQQRAKQ4iUrAMi0yhQlKHAsY898vGUuOb07SMIVLHmAcC7jiv8+/A6woiwDMeYCrWMA6BoCAjc39oVX9WVzu565GMAHrWMAyukR8gm6K6vx6wPyCmSVaxgIeI28y70atQLfCi6MTlJv8GAsYYJsCoHj6SE232tBQWWKbDiTAJMzNgwbH26sgyvK/SGUetHl8q8BoKeudblsLYuyV/x72ijLGUHyrsPbU7FSCL9dfnHw2us3Rx31JXLm0QPNrmLFAxYBteuQ4I5F+DkT1twXaLp0lPjOMy4uEgCUZDBuMkKwKcWfMNUWFOzKlfF344AKHAkAgTV/QlUSy/X6qNqHMuL4EC7SCGZ0aU5J/WzSLYgGMDH0WwQY4K8Dih8iGj3c0S4JrwJBTAbYKxKObO6HBMYIrxGG0D0h/ojcVnYawH6hDWKfrIMCLQigzS/U/AuAS3g92ukA+55LNxyAEXSN+MaxxfwrddnJC3vh3o4DID4AEwXQRjZ6fJK62BA3XAjABAAQ4gDvOM5H7odbgGOhdH/14H5w4RC3fJYKaN4HsObJzc3zKjDNyeidvzjAIbf7pg4w449EWz5wtx1Ok6yQLkZZKqdFM/sg9vdIJZiAoewyQw5oZACsGLd34VkamoDQ5VgQqj01nSC9RHcMtpKz6KgTQpfPkkhzyMhK6Td5KurTzlsjhk9RGAk6fBC8eE5Zhm34y0Y48kUTfgdpIYEkZ1WuVsFBszUCfhIHzSM172RU4yWJtQSmFH+GYHBZUKsggqXEt8eyO4eEIRGm0KoJeL2wG0oTTXJs22Y3tYe03cLLSjfueZSC+eAbrPS2Kds1CGF4m9p1z2X6XF4F5gMwAN0atrxnlMIXA8fmCNjp5K6pFhRfOnjIudYFQCZA7XZm6tmTGJm2QJz+IEZm2/5292fU7nFZAg7mM5fsfks59G1hcugXRgBEPH0ddICfBxZyBWDbu1YgEAPzsWUTNs+QgGLkfQ2AvKoe4msAu4FyGIZGqgNA8KqotgagA2UZCaDgt89x8SMB1jW6rAbAtQHiG4DGvhQNOMw4AT4KYYDVaoAistISQIUWX/kg1q7qXZuZBKp3UQD4VZyCzrcEmuUg2Z6P398mOjgJWvvFKm+NarKnXpBqD75JuMU2AoAIfNCvjfj+tfpKc7j76Ox813O2w19lrie7GJqENb+M+AR4PV160zdDI3zvqN6/d/VWsZ20wjeRjfHm/MZfHgAggvvavxhYWvxOTy5+7yA4yi0gs7X5JiL9Bxf9V9eYOLAwvpz/+YcGYodGFHcqK1V29Rwiv0Xr66+K/rBVgpsMbyL28BdyiIwPhFH/vlhaF+F17xBxrJHwzdQkftX311T9TfyXKUJsr6iSs/TP/GY3Capziq+s6xvCH0NcGoXKHymAJ1rUO2MxTiqh26a7dRJDmgLw+9QtlfgJy2E72kzTrB/HX6B/CeMnJ8xoy9Wa2QD0Pt12WdYVyReobPovet1H/Di5/hy8hM822QPqXQFNMoyfgTBC1vssgFdsOoel5AsTRSqHT0Mp/37g1XAwwwSyEFijqj4NJUnfUU0kAGmmIq2wM9IB2KNjWaAsBOU5vAm3BCXmSF0mkDkFtK9Zgp8yT6u+TCBzCnfq16j4lUzpmcbUpW+kI25CGqCCJzAJyE7w8rzBeykAHONhGD97ChgM2xQAWu/tuYCcHCKfKbsInVe8YZ1FWGEbJbdf+vpB8c8DYBvVkwEe3uxoyJxHeEOPSelFJT78/up/GWDQTlNmMu8UGwDOJPi9Uz91UiZOd997+js7PgijQ6ndSXZN/T8S/+yarkknpOsg+TvGj/92tv0GK8QLl0ov9+MAAAAASUVORK5CYII=" alt="Icon" className="w-full h-full object-contain" />
           </div>
           <span className="text-sm">Comissões diretas</span>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between py-2 text-zinc-400 text-xs border-b border-white/10 uppercase">
            <span className="w-1/4">nível</span>
            <span className="w-2/4 text-center">Rollover equipe</span>
            <span className="w-1/4 text-right">Proporção</span>
          </div>
          <div className="flex flex-col">
            {[
              { n: 1, r: '1', p: '0,1%' },
              { n: 2, r: '100', p: '0,2%' },
              { n: 3, r: '500', p: '0,3%' },
              { n: 4, r: '10.000', p: '0,4%' },
              { n: 5, r: '500.000', p: '1%' },
              { n: 6, r: '1.000.000', p: '2%' },
              { n: 7, r: '3.000.000', p: '3%' },
              { n: 8, r: '5.000.000', p: '5%' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-3 text-white text-xs border-b border-white/5 last:border-0">
                <span className="w-1/4">{row.n}</span>
                <span className="w-2/4 text-center">{row.r}</span>
                <span className="w-1/4 text-right text-amber-500 font-bold">{row.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-5 mb-[100px] mx-[10px] p-[10px] rounded-[6px] bg-white/5 text-white flex flex-col gap-2">
         <div className="text-[14px] font-bold mb-1">Descrição da Atividade</div>
         <div className="text-[12px] leading-relaxed">1. O uso do bônus deve seguir as regras da plataforma.</div>
         <div className="text-[12px] leading-relaxed">2. A empresa reserva-se o direito de interpretação final sobre esta atividade.</div>
      </div>
    </div>
  </div>
  );
};

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        setUserInfo(parsed);
      } catch (e) {
        console.error('Failed to parse userInfo:', e);
      }
    }

    // 监听登录状态变化
    const handleAuthChange = () => {
      const newToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!newToken) {
        navigate('/login');
      } else {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsed = JSON.parse(storedUserInfo);
            setUserInfo(parsed);
          } catch (e) {
            console.error('Failed to parse userInfo:', e);
          }
        }
      }
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, [navigate]);

  if (!userInfo) {
    return null; // 或者显示加载中
  }

  const username = userInfo.username || userInfo.name || 'User';
  const userId = userInfo.id || userInfo.user_id || '';
  const balance = userInfo.balance || userInfo.money || 0;

  return (
    <div className="flex flex-col gap-4 pb-24 -mt-4">
      {/* Top Header Section */}
      <div 
        className="relative p-4 flex flex-row justify-between text-white -mx-4"
        style={{
          backgroundImage: "url('https://www.pg7x7.com/static/images/mines/personal_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Left Section */}
        <div className="flex flex-col">
          <div className="w-[71px] h-[71px] rounded-[5px] overflow-hidden">
            <img 
              src={userInfo.avatar || "https://admin.pg7x7.com/uploads/20250726/f979ed32323c869f59c3e445e9927e5a.png"} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-[16px] font-bold mt-2 leading-none">{username}</div>
          <div className="flex items-center gap-1.5 mt-2 opacity-90">
            <span className="text-[12px]">ID: {userId}</span>
            <img 
              src="https://www.pg7x7.com/static/images/copy.png" 
              alt="copy" 
              className="w-3 h-3 object-contain cursor-pointer active:scale-90 transition-transform"
              onClick={() => {
                navigator.clipboard.writeText(userId.toString());
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end flex-1 ml-4">
          {/* Top Utility Buttons */}
          <div className="flex gap-4 mb-4">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <img src="https://www.pg7x7.com/static/images/support.png" alt="Support" className="h-[20px] w-auto object-contain" />
              <span className="text-[10px]">Suporte</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <img src="https://www.pg7x7.com/static/images/messages.png" alt="Messages" className="h-[20px] w-auto object-contain" />
              <span className="text-[10px]">Mens...</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <img src="https://www.pg7x7.com/static/images/user.png" alt="User" className="h-[20px] w-auto object-contain" />
              <span className="text-[10px]">Dados</span>
            </div>
          </div>

          {/* Balances */}
          <div className="flex flex-col items-end gap-1 mb-4">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] opacity-80">Saldo:</span>
              <span className="text-white font-bold text-[15px]">R$ {balance.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] opacity-80">O bônus recebido hoje:</span>
              <span className="text-white font-bold text-[15px]">R$ {(userInfo.today_bonus || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-[15px]">
            <button 
              className="flex items-center px-[10px] rounded-[6px] transition-all active:scale-95 h-[44px] w-[100px]"
              style={{
                background: 'linear-gradient(180deg, #fdffab, #d0a138 52%, #eed562)',
                boxShadow: 'inset 0 -3px 0 0 #c5962e',
                color: '#000'
              }}
            >
              <img src="https://www.pg7x7.com/static/images/mines/home_recharge.png" alt="Deposit" className="w-[17px] h-[17px] object-contain" />
              <span className="text-[13px] font-bold ml-[5px]">Deposito</span>
            </button>
            <button 
              className="flex items-center px-[10px] rounded-[6px] transition-all active:scale-95 h-[44px] w-[100px]"
              style={{
                background: 'linear-gradient(180deg, #ffe1cf, #ca927d 52%, #ffe1cf)',
                boxShadow: 'inset 0 -3px 0 0 #ca927d',
                color: '#000'
              }}
            >
              <img src="https://www.pg7x7.com/static/images/mines/home_withdrawal.png" alt="Withdraw" className="w-[17px] h-[17px] object-contain" />
              <span className="text-[13px] font-bold ml-[5px]">Saque</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIP Section Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-[12px] p-4 mt-4 shadow-xl border border-white/10">
        <div className="flex flex-col">
          <span className="text-white text-[14px] mb-2">Restantes VIP1 Depósito mais 30</span>
          
          <div className="flex items-center gap-4">
            {/* VIP Badge Left */}
            <div className="relative w-[100px] h-[80px] flex items-center justify-center">
              <img 
                src="https://www.pg7x7.com/static/images/vip-background.png" 
                alt="VIP Background" 
                className="absolute inset-0 w-full h-full object-contain"
              />
              <span className="relative z-10 text-white font-bold text-[18px] mt-2">VIP 0</span>
            </div>

            {/* Progress Info Right */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center mb-2 mt-4 text-[13px]">
                <span className="text-white/80 mr-2">depósito total: </span>
                <span className="text-[#FF5A2C] font-bold">0 / 30</span>
              </div>
              
              <div className="relative w-full h-[12px] bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#37DFB1] rounded-full shadow-[0_0_8px_rgba(55,223,177,0.5)]"
                  style={{ width: '5%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-col gap-2">
        <div className="mx-[15px] mt-[10px] px-[10px] bg-white/[0.04] rounded-[10px] overflow-hidden">
           {[
             { img: "https://www.pg7x7.com/static/images/mines/personal_mensagem.png", label: "Pontuação de reputação atual" },
             { img: "https://www.pg7x7.com/static/images/mines/personal_gift.png", label: "registro de desconto" },
             { img: "https://www.pg7x7.com/static/images/mines/personal_registrodoJogo.png", label: "registro do jogo" },
             { img: "https://www.pg7x7.com/static/images/mines/personal_mensagem.png", label: "registros de cobrança" },
             { img: "https://www.pg7x7.com/static/images/mines/personal_setting.png", label: "configurar" }
           ].map((item, idx) => (
             <div key={idx} className={`flex items-center justify-between py-3.5 cursor-pointer active:bg-white/5 transition-colors ${idx !== 4 ? 'border-b border-white/[0.05]' : ''}`}>
               <div className="flex items-center gap-[8px]">
                 <img src={item.img} alt={item.label} className="w-[18px] h-[18px] object-contain" />
                 <span className="text-white text-[14px]">{item.label}</span>
               </div>
               <ChevronRight size={15} className="text-[#888888]" />
             </div>
           ))}
        </div>

        <div className="mx-[15px] mb-8 px-[10px] bg-white/[0.04] rounded-[10px] overflow-hidden">
           <div className="flex items-center justify-between py-3.5 cursor-pointer active:bg-white/5 transition-colors">
             <div className="flex items-center gap-[8px]">
               <div className="w-[18px] flex justify-center text-[#888888] rotate-180">
                 <ChevronRight size={18} />
               </div>
               <span className="text-white text-[14px]">Sair</span>
             </div>
             <ChevronRight size={15} className="text-[#888888]" />
           </div>
        </div>
      </div>
    </div>
  );
};

const DepositPage = () => {
  const [selectedAmount, setSelectedAmount] = useState(20);
  const amounts = [20, 30, 50, 100, 200, 500, 1000, 2000, 3000];

  return (
    <div className="flex flex-col gap-4 -mt-8">
      {/* Alert Bar */}
      <div className="bg-[#f7d372] px-4 py-2 flex items-center gap-2 -mx-4">
        <div className="w-5 h-5 flex items-center justify-center">
          <img src="https://ik.imagekit.io/gpbvknoim/0091_xiaoxi_zi.png" alt="" className="w-full h-full object-contain" />
        </div>
        <span className="text-[11px] text-black font-medium leading-tight">Atualmente, a taxa de sucesso do canal pix é de 100%</span>
      </div>

      {/* Bonus Hint */}
      <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3 flex gap-2">
        <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Os membros podem receber a recompensa correspondente após a realização do depósito. O bónus adicional e o bónus de depósito podem ser acumulados e oferecidos
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-24">
        {/* Input Display */}
        <div className="bg-[#121212] rounded-xl border border-white/5 p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Valor do Depósito</span>
            <div className="flex items-baseline gap-1">
              <span className="text-amber-500 text-lg font-bold">R$</span>
              <span className="text-white text-3xl font-black">{selectedAmount > 0 ? selectedAmount.toFixed(2) : ""}</span>
              {selectedAmount === 0 && <span className="text-zinc-600 text-lg font-medium">depósito mínimo: 20</span>}
            </div>
          </div>
          <button className="text-zinc-500 hover:text-white" onClick={() => setSelectedAmount(0)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={`relative h-[72px] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                selectedAmount === amount 
                ? 'border-amber-500 bg-amber-500/10' 
                : 'border-white/10 bg-white/5'
              }`}
            >
              <span className={`text-sm font-black ${selectedAmount === amount ? 'text-amber-500' : 'text-white'}`}>
                R$ {amount}
              </span>
              <span className="text-[10px] font-bold text-orange-500/90">
                Brindes {amount}
              </span>
            </button>
          ))}
        </div>

        {/* Deposit Button */}
        <div className="mt-2">
          <button className="w-full h-[54px] rounded-full bg-[linear-gradient(180deg,#fdffab,#d0a138_52%,#eed562)] shadow-[0_4px_15px_rgba(197,150,46,0.3)] text-amber-950 font-black text-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Depósito
          </button>
        </div>

        {/* History Link */}
        <button className="text-zinc-400 text-[15px] font-normal hover:text-white transition-colors mt-2 text-center">
          Ver histórico de depósitos
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 检查登录状态
  const checkAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
  };

  // 处理tab切换，检查是否需要登录
  const handleTabChange = (tab: Tab) => {
    // deposit 和 profile 需要登录
    if ((tab === 'deposit' || tab === 'profile') && !checkAuth()) {
      navigate('/login');
      return;
    }
    setActiveTab(tab);
  };

  // 监听登录状态变化
  useEffect(() => {
    const handleAuthChange = () => {
      // 如果当前在需要登录的页面但未登录，跳转到登录页
      if ((activeTab === 'deposit' || activeTab === 'profile') && !checkAuth()) {
        navigate('/login');
      }
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, [activeTab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'promo': return <PromotionPage />;
      case 'commission': return <CommissionPage />;
      case 'deposit': return checkAuth() ? <DepositPage /> : null;
      case 'profile': return checkAuth() ? <ProfilePage /> : null;
      default: return <HomePage />;
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex justify-center bg-zinc-950"
      style={{ 
        backgroundImage: "url('https://ik.imagekit.io/gpbvknoim/main_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div 
        className="w-full max-w-md min-h-screen text-zinc-300 font-sans shadow-2xl relative overflow-x-hidden flex flex-col border-x border-white/5"
        style={{ 
          backgroundImage: "url('https://ik.imagekit.io/gpbvknoim/main_bg.png')",
          backgroundSize: '100% auto',
          backgroundRepeat: 'repeat-y',
          backgroundColor: '#1A1A1A'
        }}
      >
        {/* Header */}
        {activeTab === 'home' && (
          <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#291f16] h-[60px] flex items-center px-2 justify-between border-b border-white/5">
            <div className="flex items-center gap-1.5">
              {/* Off Icon */}
              <div 
                className="w-[34px] h-[34px] flex items-center justify-center cursor-pointer ml-1"
                onClick={() => setIsSidebarOpen(true)}
              >
                <img 
                  src="https://www.pg7x7.com/static/images/off.png" 
                  alt="Menu" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Logo */}
              <div className="flex items-center ml-1">
                <img 
                  src="https://admin.pg7x7.com/uploads/20250929/fff75c2750f35ad5500bce1eb179481b.png" 
                  alt="Logo" 
                  className="w-[92px] h-[26px] object-contain"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Login Buttons Group */}
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => navigate('/login')}
                  className="relative ml-[8px] h-[28px] w-[60px] rounded-[8px] text-[rgba(0,0,0,0.85)] text-[12px] flex items-center justify-center font-bold cursor-pointer active:scale-95 transition-transform"
                  style={{ backgroundImage: 'linear-gradient(180deg,#fdffab,#d0a138 52%,#eed562)' }}
                >
                  Entrar
                </div>
                <div className="relative group cursor-pointer">
                  <div 
                    onClick={() => navigate('/register')}
                    className="h-[28px] w-[60px] rounded-[8px] text-[rgba(0,0,0,0.85)] text-[12px] flex items-center justify-center font-bold cursor-pointer active:scale-95 transition-transform"
                    style={{ backgroundImage: 'linear-gradient(180deg,#ffe1cf,#ca927d 52%,#ffe1cf)' }}
                  >
                    Registro
                  </div>
                  <div className="absolute -top-2 -right-1 bg-red-600 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse shadow-lg whitespace-nowrap">
                    Bônus
                  </div>
                </div>
              </div>

              {/* Service Icon */}
              <div 
                className="w-[29px] h-[29px] flex items-center justify-center cursor-pointer border border-[#feffaf] rounded-[9px] mr-1"
                style={{ backgroundImage: 'linear-gradient(135deg,#261b19,#382c2a)' }}
              >
                 <img src="https://ik.imagekit.io/gpbvknoim/home_top_service.png" alt="Service" className="w-[20px] h-[20px] object-contain" />
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={`${activeTab === 'home' ? 'pt-20' : (activeTab === 'deposit' ? 'pt-0' : 'pt-2')} px-4 flex-1`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          
        </main>

        {/* Floating Support Button (Visible on Home) */}
        {activeTab === 'home' && (
          <div className="fixed bottom-24 left-1/2 translate-x-[110px] z-40">
            <div className="relative group">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden shadow-xl shadow-black/60">
                 <ImageWithFallback src="https://images.unsplash.com/photo-1629991787749-e2a79eea0471?w=200" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-2 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-[#1A1A1A] animate-bounce" />
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <nav 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 h-24 px-2 flex items-center justify-around pb-2"
          style={{ 
            backgroundImage: "url('https://ik.imagekit.io/gpbvknoim/menu_bg.png')", 
            backgroundSize: '100% auto', 
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom center'
          }}
        >
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            activeImg="https://ik.imagekit.io/gpbvknoim/menu_home_click.png"
            inactiveImg="https://ik.imagekit.io/gpbvknoim/menu_home_original.png"
          />
          <NavButton 
            active={activeTab === 'promo'} 
            onClick={() => setActiveTab('promo')} 
            activeImg="https://ik.imagekit.io/gpbvknoim/menu_activity_click.png"
            inactiveImg="https://ik.imagekit.io/gpbvknoim/menu_activity_original.png"
          />
          
          {/* Middle Button Container (transparent to show GIF behind) */}
          <button 
            onClick={() => setActiveTab('commission')} 
            className="flex flex-col items-center flex-1 -mt-10 relative z-10 transition-transform active:scale-95"
          >
            <img 
              src="https://ik.imagekit.io/gpbvknoim/menu_agent_original.png" 
              alt="Commission" 
              className={`w-20 h-20 object-contain transition-all duration-300 ${activeTab === 'commission' ? '-translate-y-2 scale-110' : 'translate-y-4'}`} 
            />
          </button>

          <NavButton 
            active={activeTab === 'deposit'} 
            onClick={() => handleTabChange('deposit')} 
            activeImg="https://ik.imagekit.io/gpbvknoim/menu_wallet_click.png"
            inactiveImg="https://ik.imagekit.io/gpbvknoim/menu_wallet_original.png"
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => handleTabChange('profile')} 
            activeImg="https://ik.imagekit.io/gpbvknoim/menu_personal_click.png"
            inactiveImg="https://ik.imagekit.io/gpbvknoim/menu_personal_original.png"
          />
        </nav>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

// 路由组件
export default function App() {
  const location = useLocation();
  
  // 如果是登录或注册页面，直接渲染对应页面
  if (location.pathname === '/login') {
    return <LoginPage />;
  }
  
  if (location.pathname === '/register') {
    return <RegisterPage />;
  }
  
  // 其他路由渲染主应用
  return <MainApp />;
}

function NavButton({ active, onClick, activeImg, inactiveImg }: { active: boolean, onClick: () => void, activeImg: string, inactiveImg: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center flex-1 transition-all duration-300">
      <img 
        src={active ? activeImg : inactiveImg} 
        alt="nav item" 
        className={`w-20 h-20 object-contain transition-all duration-300 ${active ? '-translate-y-2 scale-110' : 'translate-y-4'}`}
      />
    </button>
  );
}

// Footer Section Component
function FooterSection() {
  return (
    <div className="w-full px-[10px] pb-[100px] text-white text-[11px] box-border mt-8">
      {/* Partners Title Section */}
      <div className="relative mb-6">
        <img 
          src="/static/images/part.png" 
          alt="Partners" 
          className="w-full h-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {/* Partner Logos Grid */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 px-4 flex-wrap">
          {/* PG Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/pg.png" 
              alt="PG Pocket Games Soft" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* Pragmatic Play Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/pp.png" 
              alt="Pragmatic Play" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* JDB Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/jbd.png" 
              alt="JDB" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* EvoPlay Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/evo.png" 
              alt="Evoplay" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* PG7X7 Center Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="https://admin.pg7x7.com/uploads/20250929/fff75c2750f35ad5500bce1eb179481b.png" 
              alt="PG7X7" 
              className="w-[50px] h-auto object-contain"
            />
          </div>
          
          {/* BGaming Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/bgaming.png" 
              alt="BGaming" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* Tada Logo */}
          <div className="partner-logo flex-shrink-0">
            <img 
              src="/static/images/tada.png" 
              alt="TaDa Gaming" 
              className="w-[50px] h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <img 
            src="/static/images/share.png" 
            alt="Share" 
            className="h-[13px] w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-white text-[11px]">Compartilhar</span>
        </div>
        <img 
          src="/static/images/tg.png" 
          alt="Telegram" 
          className="h-[40px] w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            // Add Telegram share functionality
            window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href), '_blank');
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Brand Logo and Download Button */}
      <div className="flex items-center justify-between mb-4 px-2">
        <img 
          src="https://admin.pg7x7.com/uploads/20250929/fff75c2750f35ad5500bce1eb179481b.png" 
          alt="PG7X7" 
          className="h-[30px] w-auto"
        />
        <button 
          className="px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-white text-[11px] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.15)] transition-colors"
          onClick={() => {
            // Add download app functionality
            console.log('Download App clicked');
          }}
        >
          Baixar App
        </button>
      </div>

      {/* Legal Text */}
      <div className="text-white text-[11px] leading-relaxed mb-4 px-2">
        PG7X7 é operada pela Dubet N.V., número de registro da empresa 18692, com endereço registrado em Zuikertuintjeweg Z/N (Zuikertuin Tower) Curaçao e é licenciada e autorizada pelo governo de Curaçao. WJCASINO opera sob a Master License of Gaming Services Provider, N.V. Número da Licença: GLH-OCCHKTW0682826024
      </div>

      {/* Footer Bottom - Copyright and Version */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-white text-[11px]">©2025 PG7X7 os direitos reservados 2002-2030</span>
        <span className="text-white text-[11px]">ver:1.3.3(1P)</span>
      </div>

      {/* Disclaimer */}
      <div className="px-2">
        <span className="text-white text-[11px]">O ganho final não é garantido</span>
      </div>
    </div>
  );
}
