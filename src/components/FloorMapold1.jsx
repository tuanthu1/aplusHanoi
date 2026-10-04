import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; 
import './FloorMap.css';
import { useTranslation, Trans } from 'react-i18next';
import { toast } from 'react-toastify';

const tablePaths = [
  { id: 'sv', d: 'M297.5 53.5L286.5 73L297.5 79.5L311.5 55L311 49.5L297 33L292.5 31.5H237L232.5 36.5V52.5H245.5V44L288.5 44.5L297.5 53.5Z', isArea: true, labelX: 265, labelY: 60, subTables: [{ id: 'SV1', x: 235, y: 75 }] },
  { id: 'sv', d: 'M124.5 52.5H137.5V36L132.5 31.5H75L58.5 49V54.5L73 79.5L83.5 73L72 53.5L81.1871 44.5H124.5V52.5Z', isArea: true, labelX: 100, labelY: 40, subTables: [{ id: 'SV2', x: 70, y: 75 }] },
  { id: 'sv', d: 'M98.9999 182C103 181 110 179.8 114 179C116.5 178.5 116.5 172.5 114 171C108 172 88 173.5 82.4999 174C87.5 235.5 142 258.5 142 258.5C142 258.5 152.5 237 155.5 229.5C154.5 226.5 153.5 224.5 148.5 225.5C145.5 229.5 141 240 138 241C135 242 113.5 223 112 217C117 213.5 125.5 207 127.5 205.5C128 204 127.5 203 125.5 203C121 205.5 114 210.5 109.5 213C101.5 203.5 97.4999 187 97.4999 187C97.4999 187 96.5 182.625 98.9999 182Z', isArea: true, labelX: 120, labelY: 190, subTables: [{ id: 'SV6', x: 83, y: 210 }, { id: 'SV5', x: 101, y: 237 }] },
  { id: 'sv', d: 'M254.5 171C261.5 171.5 281 173 287.5 173.5C279 241 227 257.5 227 257.5C227 257.5 216.5 234 214 229C214 226.5 217 224.5 220.5 225.5C222.5 228 228 237 229.5 239C231 240.5 232 240.25 233.5 239.5C234.5 239 249.5 229.5 257.5 217C256 215.5 243.5 206.5 242 205.5C241.5 204 242.5 202.5 244 203C246.5 205 255.5 211 259.5 214C262.5 210 268 202 272 186.5C272.5 186 272 183 270.5 182.5C269 182 262 180.5 255.5 179C254.5 179 250.5 175 254.5 171Z', isArea: true, labelX: 260, labelY: 190, subTables: [{ id: 'SV3', x: 221, y: 210}, { id: 'SV4', x: 203, y: 236 }] },
  { id: 'v', d: 'M219.5 102.5C222.5 97.5 233 79 235.5 74.5005C291.5 106 288 164.501 288 164.501H256C252.5 164 253 158 256 156.501L256.05 156.494C260.033 155.996 264.029 155.496 271 154.501C273 154 273.615 153.5 273 149.501L272.987 149.413C271.96 142.735 267.374 112.911 239 93.0005C238 92.6671 237 92.5 236 93.5005C236 93.5005 227.5 105 226 107C223 107.5 220 106 219.5 102.5Z', isArea: true, labelX: 250, labelY: 120, subTables: [{ id: 'V1', x: 210, y: 136 }, { id: 'V2', x: 220, y: 160 }] },
  { id: 'v', d: 'M133.5 75C136 79 146 96.5 149.5 102.5C149 106.5 147.5 107.5 143 107C141.5 105 135.5 97 133.5 94.5C132 92.6251 130 93 128.5 94.5C101.5 114 96 148 95.4999 150.5C95.5 152.5 96.4998 153 97.4999 153.5C101 154 110.5 155.5 113.5 156C116.5 156.5 116 163.5 114.5 164.5H81.4999C81.4999 164.5 77 105 133.5 75Z', isArea: true, labelX: 120, labelY: 120, subTables: [{ id: 'V3', x: 94, y: 136 }, { id: 'V4', x: 84, y: 160 }] },
  { id: 'v', d: 'M56.5 114V105.5H42.5C41 105.5 38 101.5 38 100V86C38 84 41 81 42.5 81H56.5V72.5H34.5C32 73 31 74.5 30 77V109C30.5 111.5 32 113.5 34.5 114H56.5Z', isArea: true, labelX: 50, labelY: 90, subTables: [{ id: 'V12', x: 25, y: 111 }] },
  { id: 'vv', d: 'M57 158.5V150H43C41.5 150 38.5 146 38.5 144.5V130.5C38.5 128.5 41.5 125.5 43 125.5H57V117H35C32.5 117.5 31.5 119 30.5 121.5V153.5C31 156 32.5 158 35 158.5H57Z', isArea: true, labelX: 50, labelY: 140, subTables: [{ id: 'VV10', x: 25, y: 155 }] },
  { id: 'vv', d: 'M314.5 125.5V117H337.234C339.5 118 340.5 119.5 341 122.5V153.5C340 156.5 339.5 157.5 337 158.5H314.5V149.5H328C331 149 332 148 332.5 145.5V130.5C332 128.5 331 126.5 328 125.5H314.5Z', isArea: true, labelX: 300, labelY: 140, subTables: [{ id: 'VV1', x: 283, y: 155 }] },
  { id: 'v', d: 'M314.5 170.5V162H337.234C339.5 163 340.5 164.5 341 167.5V198.5C340 201.5 339.5 202.5 337 203.5H314.5V194.5H328C331 194 332 193 332.5 190.5V175.5C332 173.5 331 171.5 328 170.5H314.5Z', isArea: true, labelX: 297, labelY: 190, subTables: [{ id: 'V2', x: 283, y: 200 }] },
  { id: 'v', d: 'M314.5 214.5V206H337.234C339.5 207 340.5 208.5 341 211.5V242.5C340 245.5 339.5 246.5 337 247.5H314.5V238.5H328C331 238 332 237 332.5 234.5V219.5C332 217.5 331 215.5 328 214.5H314.5Z', isArea: true, labelX: 297, labelY: 240, subTables: [{ id: 'V6', x: 283, y: 244 }] },
  { id: 'v', d: 'M314.5 81V72.5H337.234C339.5 73.5 340.5 75 341 78V109C340 112 339.5 113 337 114H314.5V105H328C331 104.5 332 103.5 332.5 101V86C332 84 331 82 328 81H314.5Z', isArea: true, labelX: 297, labelY: 90, subTables: [{ id: 'V5', x: 283, y: 111 }] },
  { id: 'vv', d: 'M57 203.5V195H43C41.5 195 38.5 191 38.5 189.5V175.5C38.5 173.5 41.5 170.5 43 170.5H57V162H35C32.5 162.5 31.5 164 30.5 166.5V198.5C31 201 32.5 203 35 203.5H57Z', isArea: true, labelX: 50, labelY: 180, subTables: [{ id: 'VV9', x: 25, y: 200 }] },
  { id: 'v', d: 'M57 247.5V239H43C41.5 239 38.5 235 38.5 233.5V219.5C38.5 217.5 41.5 214.5 43 214.5H57V206H35C32.5 206.5 31.5 208 30.5 210.5V242.5C31 245 32.5 247 35 247.5H57Z', isArea: true, labelX: 50, labelY: 220, subTables: [{ id: 'V11', x: 25, y: 244 }] },
  { id: 'vv', d: 'M136 340V327H94L59 292.5V256H46V297L88 340H136Z', isArea: true, labelX: 100, labelY: 300, subTables: [{ id: 'VV8', x: 47, y: 290 }, { id: 'VV7', x: 67, y: 310 }, { id: 'VV6', x: 87, y: 330 }] },
  { id: 'sv', d: 'M174.5 346H183.5V366.5C183 370.5 180.755 373 176.5 373H144.5C140.5 372.5 139.5 372 138.5 368.5V346H146.5V358.5C147 362 149 363 151.5 364.5H169.5C172 363.5 174 361.5 174.5 358.5V346Z', isArea: true, labelX: 160, labelY: 360, subTables: [{ id: 'SV8', x: 153, y: 337.7 }] },
  { id: 'vv', d: 'M326 256H312.5V292.5L277 327H235.5V340L282.5 340.5L284 339.5L326 298V256Z', isArea: true, labelX: 290, labelY: 300, subTables: [{ id: 'VV3', x: 260, y: 290 }, { id: 'VV4', x: 240, y: 310 }, { id: 'VV5', x: 220, y: 330 }] },
  { id: 'v', d: 'M105.5 409V422.5H67.5L34.5 389V356.5H48V383L74.5 409H105.5Z', isArea: true, labelX: 70, labelY: 370, subTables: [{ id: 'V10', x: 79.5, y: 370.6 }] },
  { id: 'v', d: 'M338 356H325.5V382.5L299 408.5H268.5V422H306L338 389V356Z', isArea: true, labelX: 300, labelY: 370, subTables: [{ id: 'V9', x: 128.5, y: 370.6 }] },
  { id: 'v', d: 'M272.5 346.5H281.5V367C281 371 278.755 373.5 274.5 373.5H242.5C238.5 373 237.5 372.5 236.5 369V346.5H244.5V359C245 362.5 247 363.5 249.5 365H267.5C270 364 272 362 272.5 359V346.5Z', isArea: true, labelX: 260, labelY: 360, subTables: [{ id: 'V7', x: 226.5, y: 371 }] },
  { id: 'v', d: 'M223.5 346H232.5V366.5C232 370.5 229.755 373 225.5 373H193.5C189.5 372.5 188.5 372 187.5 368.5V346H195.5V358.5C196 362 198 363 200.5 364.5H218.5C221 363.5 223 361.5 223.5 358.5V346Z', isArea: true, labelX: 210, labelY: 360, subTables: [{ id: 'V8', x: 177.7, y: 371 }] },
  { id: 'c', d: 'M223.5 400H232.5V420.5C232 424.5 229.755 427 225.5 427H193.5C189.5 426.5 188.5 426 187.5 422.5V400H195.5V412.5C196 416 198 417 200.5 418.5H218.5C221 417.5 223 415.5 223.5 412.5V400Z', isArea: true, labelX: 210, labelY: 410, subTables: [{ id: 'C3', x: 177.7, y: 424.7 }] },
  { id: 'c', d: 'M125.5 346H134.5V366.5C134 370.5 131.755 373 127.5 373H95.5C91.5 372.5 90.5 372 89.5 368.5V346H97.5V358.5C98 362 100 363 102.5 364.5H120.5C123 363.5 125 361.5 125.5 358.5V346Z', isArea: true, labelX: 110, labelY: 360, subTables: [{ id: 'C4', x: 128.5, y: 424.7 }] },
  { id: 'c', d: 'M202.5 313L212 314V334C212 337.5 209 341 207 341H164.5C160.5 340 159 338 158.5 335V314L167.5 313V327.5C168.5 330.5 170 331.5 172.5 332H197.5C200 331.5 202 330 202.5 327.5V313Z', isArea: true, labelX: 180, labelY: 320, subTables: [{ id: 'C1', x: 275, y: 390 }, { id: 'C2', x: 252, y: 410 }] },
  { id: 'c', d: 'M174.5 400H183.5V420.5C183 424.5 180.755 427 176.5 427H144.5C140.5 426.5 139.5 426 138.5 422.5V400H146.5V412.5C147 416 149 417 151.5 418.5H169.5C172 417.5 174 415.5 174.5 412.5V400Z', isArea: true, labelX: 160, labelY: 410, subTables: [{ id: 'C5', x: 35, y: 390 }, { id: 'C6', x: 57, y: 410 }] },
  { id: 'g', d: 'M169.5 125H200M200 125V161H214V163.5H200V169.5H205.5V173H200V193H192.5V173H189.5V169.5H192.5V130.5H187.5V201H181.5V130.5H176.5V169.5H180V173H176.5V193H169V173H163.5V169.5H169V163.5H154.5V161H169V125H200Z', isArea: true, labelX: 180, labelY: 150, subTables: [{ id: 'GA', x: 152, y: 180 }] },
  { id: '', d: 'M322 0.5H372.5V46.5L322 0.5Z M372.5 436V387L320.5 436H372.5Z M0.5 388.5V436H52.5L0.5 388.5Z M0.5 0.5H51.5L0.5 51V0.5Z' },
  { id: 'BAR_AREA', d: 'M44.5 28V0.5H0.5V28H44.5Z', offsetX: 162, offsetY: 230, customStyle: { fontSize: '8px', fill: '#ffffff', fontWeight: '200' }, isArea: true, subTables: [{ id: 'BAR', x: 152, y: 262 }] },
  { id: 'STAGE_AREA', d: 'M0.5 28.5H84V0.5H0.5V28.5Z', offsetX: 142, offsetY: 53, customStyle: { fontSize: '8px', fill: '#ffffff', fontWeight: '200' }, isArea: true, subTables: [{ id: 'STAGE', x: 152, y: 86 }] }
];

const FloorMap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTableId, setActiveTableId] = useState(null);
  const [step, setStep] = useState(1); 
  const [occupancy, setOccupancy] = useState({});
    
  const [formData, setFormData] = useState({
    customerName: '',
    gender: 'Nam',
    phone: '',
    guestCount: '',
    bookingDate: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
    time: '20:30',
    bookingType: 'thuong'
  });

  // Hằng số kiểm tra xem ngày khách chọn có phải ngày Event không
  const isEventDay = formData.bookingDate === '2026-04-03';

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const data = await axiosClient.get(`/bookings/occupancy?date=${formData.bookingDate}`);
        if (data.success) {
          setOccupancy(data.occupancy);
        }
      } catch (error) {
        console.error("Lỗi khi kéo dữ liệu bàn:", error);
      }
    };
    fetchOccupancy();
  }, [formData.bookingDate]);

  const getTableCapacityNumber = () => {
    return 999;
  };

  const getTableStatus = (tableId) => {
    const currentGuests = occupancy[tableId] || 0;
    const maxCapacity = getTableCapacityNumber(tableId);
    return currentGuests >= maxCapacity ? 'booked' : 'available';
  };

  const handleTableClick = (tableId, event) => {
    if (event) event.stopPropagation(); 
    if (!tableId || tableId === 'BAR' || tableId === 'STAGE') return; 
      setFormData(prev => ({
        ...prev,
        bookingType: (tableId === 'GA' && !isEventDay) ? null : 'thuong'
      }));
    
    setSelectedTable({ id: tableId });
    setActiveTableId(tableId);
  };

  const handleInputChange = (e) => {
    if(formData.phone && e.target.name === 'phone' && !/^\d*$/.test(e.target.value)) {
      toast.info(t('phone_warning'), { autoClose: 3000 });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 21; h <= 23; h++) {
      for (let m = 0; m < 60; m++) {
        times.push(`${h}:${m < 10 ? '0' + m : m}`);
      }
    }
    for (let h = 0; h <= 0; h++) {
      for (let m = 0; m < 60; m++) {
        times.push(`0${h}:${m < 10 ? '0' + m : m}`);
      }
    }
    times.push('01:00');
    return times;
  };
  
  return (
    <div className="map-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '30px 0 15px 0' }}>
        <h2 className={isEventDay ? "glow-down-effect event-title" : "glow-down-effect"}>
          {/* Đổi tiêu đề động theo sự kiện */}
          {isEventDay ? 'A+ GLOBAL: GOOM GUM' : t('floor_title')}
        </h2>
        <i className="fa-solid fa-arrow-down bounce-arrow" style={{ margin: 0 }}></i>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>{t('floor_sd')}</label>
        <input 
          type="date" 
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleInputChange}
          style={{ padding: '5px 10px', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #d4e02e', outline: 'none' }}
        />
      </div>
      
      {/* SVG Map (Giữ nguyên) */}
      <svg viewBox="0 0 373 437" className="floor-svg-drawn">
        {tablePaths.map((area) => (
          <g key={area.id || Math.random()} className="area-group">
            <path className="area-path" d={area.d} transform={area.offsetX ? `translate(${area.offsetX}, ${area.offsetY})` : ""} />
            {area.subTables ? (
              area.subTables.map((sub) => {
                const isLocked = !sub.id || ['BAR', 'STAGE'].includes(sub.id);
                return (
                  <g key={sub.id || Math.random()} className={`table-group ${isLocked ? 'unclickable' : getTableStatus(sub.id)} ${activeTableId === sub.id ? 'active' : ''}`} onClick={isLocked ? null : (e) => handleTableClick(sub.id, e)}>
                    {sub.id && (
                      <>
                        <rect x={sub.x + 20} y={sub.y - 25} width="24" height="14" rx="0.5" className={`table-label-box box-${sub.id}`} />
                        <text x={sub.x + 32} y={sub.y - 18} className={`table-label-text label-${sub.id}`} style={sub.customStyle || area.customStyle || {}} textAnchor="middle" dominantBaseline="middle">{sub.id}</text>
                      </>
                    )}
                  </g>
                );
              })
            ) : (
              (() => {
                const isLocked = !area.id || ['BAR', 'STAGE'].includes(area.id);
                return (
                  <g className={`table-group ${isLocked ? 'unclickable' : getTableStatus(area.id)} ${activeTableId === area.id ? 'active' : ''}`} onClick={isLocked ? null : (e) => handleTableClick(area.id, e)}>
                    {area.id && (
                      <>
                        <rect x={area.labelX} y={area.labelY} width="35" height="15" rx="4" className={`table-label-box box-${area.id}`} />
                        <text x={area.labelX + 17.5} y={area.labelY + 7.5} className={`table-label-text label-${area.id}`} style={area.customStyle || {}} textAnchor="middle" dominantBaseline="middle">{area.id}</text>
                      </>
                    )}
                  </g>
                );
              })()
            )}
          </g>
        ))}
      </svg>

      {/* FORM MODAL ĐẶT BÀN */}
      {selectedTable && (
        <div className="modal-overlay">
           <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: step === 2 ? '600px' : '400px', position: 'relative' }}>
            <button 
              onClick={() => { setSelectedTable(null); setActiveTableId(null); setStep(1); }} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', color: '#888', border: 'none', fontSize: '20px', cursor: 'pointer', transition: '0.2s' }}
              onMouseOver={(e) => e.target.style.color = '#ff4d4f'}
              onMouseOut={(e) => e.target.style.color = '#888'}
            >
              ✖
            </button>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {t('modal_book_table')} <span className="highlight" style={{color: '#d4e02e'}}>{selectedTable.id}</span>
            </h2>
            
            {/* Logic: Nếu chọn bàn GA VÀ không phải ngày Event VÀ chưa chọn Type */}
            {selectedTable.id === 'GA' && !isEventDay && !formData.bookingType ? (
              <div style={{ padding: '20px 0' }}>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>{t('modal_choose_ga')}</p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => setFormData({...formData, bookingType: 'voucher'})}
                    style={{ flex: 1, padding: '20px', background: '#111', border: '2px solid #a855f7', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {t('modal_ga_voucher')}
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, bookingType: 'thuong'})}
                    style={{ flex: 1, padding: '20px', background: '#111', border: '2px solid #d4e02e', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {t('modal_ga_normal')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  
                  // 1. MẶC ĐỊNH: Tất cả các bàn xịn (SV, VV, V, C...) sẽ đi vào MENU FULL
                  let targetRoute = '/menu'; 
                  
                  // 2. CHỈ KHI NÀO LÀ BÀN "GA" THÌ MỚI PHÂN LUỒNG RẼ NHÁNH:
                  if (selectedTable.id === 'GA') {
                    if (formData.bookingType === 'voucher') {
                      targetRoute = '/menu-voucher'; // GA chọn Voucher
                    } else {
                      targetRoute = '/menu-normal';  // GA chọn Thường
                    }
                  }

                  // 3. Thực hiện chuyển trang
                  navigate(targetRoute, { 
                    state: { bookingData: { ...formData, tableId: selectedTable.id } } 
                  });
                }} style={{ textAlign: 'left', marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{t('form_name')}:</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                        {t('form_gender')}: 
                      </label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', cursor: 'pointer' }}>
                        <option value="Nam"> {t('gender_male')}</option>
                        <option value="Nữ"> {t('gender_female')}</option>
                        <option value="Khác"> {t('gender_other')}</option>
                      </select>
                    </div>
                  </div>

                  {/* HÀNG 2: SĐT + SỐ NGƯỜI */}
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{t('form_phone')}:</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{t('form_guests')}</label>
                      <input type="number" name="guestCount" value={formData.guestCount} min="1" max="12" placeholder={t('form_guests_ph')} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{t('form_date')}:</label>
                      <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{t('form_time')}:</label>
                      <select 
                        name="time" 
                        value={formData.time} 
                        onChange={handleInputChange} 
                        required 
                        style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        {generateTimeOptions().map((time, idx) => (
                          <option key={idx} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={{ flex: 2, background: '#d4e02e', color: '#000', fontWeight: 'bold', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer' }}>
                      {t('btn_continue')}
                    </button>
                    <button type="button" onClick={() => { setSelectedTable(null); setActiveTableId(null); setStep(1); }} style={{ flex: 1, background: 'transparent', color: '#888', border: '1px solid #444', padding: '12px', borderRadius: '5px', cursor: 'pointer' }}>{t('btn_cancel')}</button>
                  </div>
                </form>
              </>
            )}
           </div>
        </div>
      )}

      {/* RENDER BẢNG GIÁ DỰA TRÊN NGÀY CHỌN */}
      {isEventDay ? (
        // BẢNG GIÁ ĐẶC BIỆT CHO EVENT 03/04/2026
        <div className="pricing-section" style={{ marginTop: '40px' }}>
          <table className="pricing-table" style={{ width: '100%', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ textAlign: 'center', fontSize: '20px', paddingBottom: '15px', textTransform: 'uppercase', color: '#d4e02e' }}>
                  A+ GLOBAL: GOOM GUM - FRI. 03.04.26
                </th>
              </tr>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th className="col-left" style={{ padding: '10px 0', textAlign: 'left' }}>TABLE / LOẠI BÀN</th>
                <th className="col-right" style={{ padding: '10px 0', textAlign: 'right' }}>MINIMUM SPENDING / CHI TIÊU TỐI THIỂU</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><div className="legend-box gathuong" style={{ width:'100%', marginBottom: '5px', padding: '8px', background: '#ff0000' }}>GA (4 TICKETS)</div></td>
                <td className="price" style={{ textAlign: 'right', fontWeight: 'bold' }}>4.000.000 <span>VND</span></td>
              </tr>
              <tr>
                <td><div className="legend-box vip" style={{ width:'100%', marginBottom: '5px', padding: '8px', background: '#e0e0e0' }}>VIP (6 TICKETS)</div></td>
                <td className="price" style={{ textAlign: 'right', fontWeight: 'bold' }}>8.000.000 <span>VND</span></td>
              </tr>
              <tr>
                <td><div className="legend-box vvip" style={{ width:'100%', marginBottom: '5px', padding: '8px', background: '#3b82f6' }}>VVIP & CABANA (8 TICKETS)</div></td>
                <td className="price" style={{ textAlign: 'right', fontWeight: 'bold', color: '#3b82f6' }}>16.000.000 <span>VND</span></td>
              </tr>
              <tr>
                <td><div className="legend-box svip" style={{ width:'100%', marginBottom: '5px', padding: '8px', background: '#d4e02e' }}>SVIP (10 TICKETS)</div></td>
                <td className="price sv8-price" style={{ textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>24.000.000 <span>VND</span></td>
              </tr>
              <tr>
                <td><div className="legend-box president" style={{ width:'100%', marginBottom: '5px', padding: '8px', background: '#f97316' }}>SV8 (10 TICKETS)</div></td>
                <td className="price cabana-price" style={{ textAlign: 'right', fontWeight: 'bold', color: '#f97316' }}>39.000.000 <span>VND</span></td>
              </tr>
            </tbody>
          </table>
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: '11px', marginTop: '15px', lineHeight: '1.6' }}>
            <p>*AN ADDITIONAL CHARGE OF 800,000 VND/ 1 PAX APPLIES FOR GROUPS EXCEEDING THE REGULATORY LIMIT</p>
            <p>*INCLUDED SERVICE CHARGE AND VAT</p>
            <p style={{ marginTop: '5px' }}>*PHỤ THU 800.000 VNĐ/NGƯỜI NẾU VƯỢT QUÁ SỐ LƯỢNG QUY ĐỊNH.</p>
            <p>*ĐÃ BAO GỒM PHÍ DỊCH VỤ VÀ VAT.</p>
          </div>
        </div>
      ) : (
        // BẢNG GIÁ NGÀY BÌNH THƯỜNG (Original Pricing)
        <div className="pricing-section">
          <table className="pricing-table">
            <thead>
              <tr>
                <th className="col-left">{t('table_min_spend')}</th>
                <th className="col-right">{t('table_weekday')}</th>
                <th className="col-right">{t('table_weekend')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><div className="legend-box vip">VIP</div></td><td className="price">5.000.000 <span>VND</span></td><td className="price">6.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box vvip">VVIP</div></td><td className="price">6.000.000 <span>VND</span></td><td className="price">8.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box svip">SVIP</div></td><td className="price">8.000.000 <span>VND</span></td><td className="price">12.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box sv8">SV8</div></td><td className="price sv8-price">20.000.000 <span>VND</span></td><td className="price sv8-price">30.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box cabana">CABANA</div></td><td className="price cabana-price">8.000.000 <span>VND</span></td><td className="price cabana-price">12.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box gathuong">{t('table_ga_normal')}</div></td><td className="price cabana-price">3.000.000 <span>VND</span></td><td className="price cabana-price">3.000.000 <span>VND</span></td></tr>
              <tr><td><div className="legend-box gavoucher">{t('table_ga_voucher')}</div></td><td className="price cabana-price">1.299.000 <span>VND</span></td><td className="price cabana-price">1.299.000 <span>VND</span></td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FloorMap;