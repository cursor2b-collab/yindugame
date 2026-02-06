import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: 'https://www.pg7x7.com/static/images/1.png', label: 'Tesouro' },
  { icon: 'https://www.pg7x7.com/static/images/2.png', label: 'Agente' },
  { icon: 'https://www.pg7x7.com/static/images/3.png', label: 'Rebate' },
  { icon: 'https://www.pg7x7.com/static/images/5.png', label: 'Super' },
  { icon: 'https://www.pg7x7.com/static/images/6.png', label: 'Resgatar' },
  { icon: 'https://www.pg7x7.com/static/images/7.png', label: 'Misterioso' },
  { icon: 'https://www.pg7x7.com/static/images/8.png', label: 'Cashback' },
  { icon: 'https://www.pg7x7.com/static/images/9.png', label: 'Bônus' },
  { icon: 'https://www.pg7x7.com/static/images/10.png', label: 'Magnata' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // Base64 Icons
  const depositIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAAXNSR0IArs4c6QAAACRQTFRFR3BMKB8WKR4WKR8VKR8WKB8WKR8WKR8VKR8WKR8WKR8WKR8WXIWMqAAAAAt0Uk5TAA4jOFJzjKzG4PPHOqaFAAACc0lEQVR42u3Z0Y7jIAwF0Gtsg7H//39X2+yEpsnMEgoPI/W8pa1o8LVLpOLj4+PjFyMp5l4tM1Yg9fhSBdNxjWeFMJd4PGSp8WAJM7HHJkFjY4R5qLbKcIlNxjw5HpwP22HcIqWUrMI4I48HBZIkQOKh4BaJfywLXb9F4IgQwL+u70jReBGgKbHZauWisRHcUuOZ53R6JyFZbEZi1jjykrDxaEVPubYPYKxGTSb8dZxfKvsl7ilx4rko4C/h1MFJSB4XDLDDNe3F1IF5Oqv760ayRS2x4ZFfhLME3kuuHmVvhzr0m3aWv2rk6Xgfivv0ukbSzhnss1AJXNL4qdJoa7BKkGhzbOE6HHLjqTVS2j+k2PZrjE5k8Q2jfbosbzG57om5vLN+G1n1aCoDqbYajq/f9gDKNTYmLa/uRwCLH1UGABbNKnTutzKYb3MMk6SehuVn3NZRtbhWsyQCsRSPpi+HethriQHSN8AJACgGVOo6LfHg0aM/Bokdb2fbEMZ37KXhS4xwwyVSO7ZKrjEo4UUSLRbzZBxQicnqjeGdEXON6RTPPKYrq3dgp+6frK4O2fFMYz4849U7gC/OAGVxm0JitgysnQQBlvaRE17Ymgga9piJsfYbDBdSWRRxk7RYXbCB6aebM35ic0+zs+RzW/RM4i1G+B9ZtH6ji9ZvxGNMJfThuibghsqEDl1QJkE/igGEfjySMW7QNRk3Zeyo71cXZ5ziyHIxj8YtK9sbGevVzVFiFmFORFdPhPZGBN7TaIobvKM/chwl9OOe+OyNCuWO+OidJs0dN0dxxBgvEeOKnWPqx6XJjEukVH6/Mf78Tv9ARvorwjlGHFXAAAAAElFTkSuQmCC";
  const withdrawIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAAXNSR0IArs4c6QAAACFQTFRFR3BMKxoVJx0UKR8VKh4WKR8VKR8VKR8WKR8WKR8WKR8Wj9bUwwAAAAp0Uk5TAAwaNU9+ns/l8o2OeQ4AAAFtSURBVHja7djBboQwDEXR58SO4/f/H9wFG0BhoJpYnbY5q9mMLrLiSIBlWT6PKlIpI7WgZGpBydSCkqkFJVMLSqYWlEwtKJlaUDK1oGRqQcnUgpKpBSVTC0qmFipfiYo3ifMlTxzQRvEe4w3DexpvNDxX9ExgfC1s8LeCEfXRgCtv1NEzuD6chQPtdkL90eTs6pgX58b6fYD36Xf5b0oC7AWnixVYgRX4uYC3sWkBw9gK/KWAjK1FW4EfD3RO17HnnM6xZ5zOsCedk3XBgXIyxYl2TtQVOBPz4BThJuuFZflNvgB3vbC/1VVbRwAAAABJRU5ErkJggg==";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`fixed inset-0 bg-black/80 z-[100] transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      />

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-[340px] z-[101] overflow-y-auto no-scrollbar flex flex-col"
        style={{
          backgroundColor: '#1A1A1A'
        }}
      >
        <div 
          className="p-4 flex flex-col min-h-full relative"
          style={{
            backgroundImage: 'url("https://ik.imagekit.io/gpbvknoim/homev2_menu_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Header Area */}
          <div className="flex items-center justify-between mb-2 relative h-16">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center active:scale-90 transition-transform shadow-lg z-20"
            >
              <ArrowLeft size={20} className="text-zinc-400" />
            </button>

            <div className="">
              <img 
                src="https://admin.pg7x7.com/uploads/20250929/fff75c2750f35ad5500bce1eb179481b.png" 
                alt="Logo" 
                className="h-8 object-contain"
              />
            </div>
          </div>

          {/* Guest Buttons (Entrar & Registro) - 只在未登录时显示 */}
          {!userInfo && (
            <div className="flex justify-center gap-[10px] mt-[10px] mb-[10px]">
              <button 
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="flex-1 max-w-[130px] h-[38px] rounded-[3px] border-none text-black font-bold text-[13px] bg-[linear-gradient(180deg,#FFE78C,#D4AF37_52%,#FFE78C)] shadow-[inset_0_-3px_0_0_#B8860B] active:scale-95 transition-transform flex items-center justify-center"
              >
                Entrar
              </button>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/register');
                }}
                className="flex-1 max-w-[130px] h-[38px] rounded-[3px] border-none text-black font-bold text-[13px] bg-[linear-gradient(180deg,#ffe1cf,#ca927d_52%,#ffe1cf)] shadow-[inset_0_-3px_0_0_#ca927d] active:scale-95 transition-transform flex items-center justify-center"
              >
                Registro
              </button>
            </div>
          )}

          {/* User Balance Wrapper - 只在登录时显示 */}
          {userInfo && (
            <div className="mx-2 mt-[30px] mb-[10px] p-[10px] rounded-[8px] bg-[#392c1f] shadow-lg">
              {/* User Section */}
              <div className="flex items-center gap-[10px] mb-4">
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  <ImageWithFallback 
                    src={userInfo.avatar || "https://ik.imagekit.io/gpbvknoim/logo%20(1).png"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-[14px]">{username}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-zinc-400 text-[12px]">ID：{userId}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userId.toString());
                      }}
                      className="active:scale-90 transition-transform"
                    >
                      <img 
                        src="https://www.pg7x7.com/static/images/copy.png" 
                        alt="Copy" 
                        className="w-[14px] h-[14px]"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Balance Section */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-baseline">
                  <span className="text-[#ffaa09] text-[20px] font-bold mr-[5px]">{balance.toFixed(2)}</span>
                  <span className="text-[#FFF4A8]/65 text-[12px]">R$</span>
                </div>

              <div className="flex gap-2">
                <button className="h-[32px] px-3 rounded-[3px] bg-[linear-gradient(180deg,#FFE78C,#D4AF37_52%,#FFE78C)] shadow-[inset_0_-2px_0_0_#B8860B] flex items-center text-[11px] font-bold text-black active:scale-95 transition-transform">
                  <img src={depositIcon} alt="Deposit" className="w-3.5 h-3.5 mr-1" />
                  Depósito
                </button>
                <button className="h-[32px] px-3 rounded-[3px] bg-[linear-gradient(180deg,#ffe1cf,#ca927d_52%,#ffe1cf)] shadow-[inset_0_-2px_0_0_#ca927d] flex items-center text-[11px] font-bold text-black active:scale-95 transition-transform">
                  <img src={withdrawIcon} alt="Saque" className="w-3.5 h-3.5 mr-1" />
                  Saque
                </button>
              </div>
            </div>
          </div>
          )}

          {/* 9-Grid Menu */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-2 px-2 mt-4">
            {menuItems.map((item, index) => (
              <motion.div 
                key={index}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <div className="w-[64px] h-[64px] bg-[#D6C4A4] rounded-[14px] flex items-center justify-center shadow-md overflow-hidden">
                  <img src={item.icon} alt={item.label} className="w-[48px] h-[48px] object-contain" />
                </div>
                <span className="text-white text-[12px] font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Bottom Images */}
          <div className="space-y-4 pb-4 mt-8">
            <div className="w-full cursor-pointer">
              <img 
                src="https://ik.imagekit.io/gpbvknoim/homev2_menu_service_bg.png" 
                alt="Service" 
                className="w-full h-auto block"
              />
            </div>

            <div className="w-full cursor-pointer">
              <img 
                src="https://ik.imagekit.io/gpbvknoim/homev2_menu_share_bg.png" 
                alt="Share" 
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
