const presetCities = {
  beijing: { name: "北京市", latitude: 39.9075, longitude: 116.39723, country: "中国", admin1: "北京" },
  shanghai: { name: "上海", latitude: 31.22222, longitude: 121.45806, country: "中国", admin1: "上海市" },
  guangzhou: { name: "广州", latitude: 23.11667, longitude: 113.25, country: "中国", admin1: "广东省" },
  shenzhen: { name: "深圳", latitude: 22.54554, longitude: 114.0683, country: "中国", admin1: "广东省" },
  hangzhou: { name: "杭州", latitude: 30.29365, longitude: 120.16142, country: "中国", admin1: "浙江省" },
};

const state = {
  cityKey: "beijing",
  trendMode: "temp",
  location: presetCities.beijing,
  forecast: null,
  air: null,
};

const weatherCodeMap = {
  0: { day: ["☀", "晴朗"], night: ["🌙", "晴夜"] },
  1: { day: ["🌤", "大致晴朗"], night: ["🌙", "少云"] },
  2: { day: ["⛅", "局部多云"], night: ["☁", "多云"] },
  3: { day: ["☁", "阴天"], night: ["☁", "阴天"] },
  45: { day: ["🌫", "有雾"], night: ["🌫", "有雾"] },
  48: { day: ["🌫", "雾凇"], night: ["🌫", "雾凇"] },
  51: { day: ["🌦", "小毛毛雨"], night: ["🌦", "小毛毛雨"] },
  53: { day: ["🌦", "毛毛雨"], night: ["🌦", "毛毛雨"] },
  55: { day: ["🌧", "持续毛毛雨"], night: ["🌧", "持续毛毛雨"] },
  61: { day: ["🌦", "小雨"], night: ["🌦", "小雨"] },
  63: { day: ["🌧", "降雨"], night: ["🌧", "降雨"] },
  65: { day: ["🌧", "大雨"], night: ["🌧", "大雨"] },
  66: { day: ["🌨", "冻雨"], night: ["🌨", "冻雨"] },
  67: { day: ["🌨", "强冻雨"], night: ["🌨", "强冻雨"] },
  71: { day: ["🌨", "小雪"], night: ["🌨", "小雪"] },
  73: { day: ["❄", "降雪"], night: ["❄", "降雪"] },
  75: { day: ["❄", "大雪"], night: ["❄", "大雪"] },
  77: { day: ["🌨", "阵雪"], night: ["🌨", "阵雪"] },
  80: { day: ["🌦", "阵雨"], night: ["🌦", "阵雨"] },
  81: { day: ["🌧", "较强阵雨"], night: ["🌧", "较强阵雨"] },
  82: { day: ["⛈", "强阵雨"], night: ["⛈", "强阵雨"] },
  85: { day: ["🌨", "阵雪"], night: ["🌨", "阵雪"] },
  86: { day: ["❄", "强阵雪"], night: ["❄", "强阵雪"] },
  95: { day: ["⛈", "雷阵雨"], night: ["⛈", "雷阵雨"] },
  96: { day: ["⛈", "雷暴夹小冰雹"], night: ["⛈", "雷暴夹小冰雹"] },
  99: { day: ["⛈", "强雷暴"], night: ["⛈", "强雷暴"] },
};

const reveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
};

const formatClock = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatDay = (isoString, index) => {
  if (index === 0) {
    return "今天";
  }
  return new Date(isoString).toLocaleDateString("zh-CN", { weekday: "short" });
};

const weatherInfo = (code, isDay = true) => {
  const entry = weatherCodeMap[code] || weatherCodeMap[2];
  return isDay ? entry.day : entry.night;
};

const toRounded = (value) => Math.round(Number(value));

const kmText = (meters) => `${Math.round(Number(meters) / 1000)} 公里`;

const aqiLevel = (aqi) => {
  if (aqi <= 50) return "优";
  if (aqi <= 100) return "良";
  if (aqi <= 150) return "轻度污染";
  if (aqi <= 200) return "中度污染";
  return "偏高";
};

const aqiCopy = (aqi) => {
  if (aqi <= 50) return "空气质量舒适，适合晨跑、步行和开窗通风。";
  if (aqi <= 100) return "空气质量总体可以，敏感人群可减少长时间剧烈户外活动。";
  if (aqi <= 150) return "空气略有污染，外出时间较长时建议关注身体感受。";
  return "空气质量偏弱，建议减少长时间户外停留。";
};

const buildSummary = (forecast) => {
  const current = forecast.current;
  const todayMax = toRounded(forecast.daily.temperature_2m_max[0]);
  const todayMin = toRounded(forecast.daily.temperature_2m_min[0]);
  const rainChance = toRounded(forecast.daily.precipitation_probability_max[0] ?? 0);
  const [, label] = weatherInfo(current.weather_code, current.is_day === 1);

  let extra = "体感整体舒适。";
  if (current.apparent_temperature - current.temperature_2m >= 2) {
    extra = "体感会比实际温度更闷一些。";
  } else if (current.temperature_2m - current.apparent_temperature >= 3) {
    extra = "风感明显，体感会偏凉。";
  }

  return `当前${label}，预计今天最高 ${todayMax}°，最低 ${todayMin}°。降水概率约 ${rainChance}%，${extra}`;
};

const buildTags = (forecast) => {
  const rainChance = toRounded(forecast.daily.precipitation_probability_max[0] ?? 0);
  const uv = Number(forecast.daily.uv_index_max?.[0] ?? 0);
  const wind = toRounded(forecast.current.wind_speed_10m);

  const uvLabel = uv >= 7 ? "紫外线偏强" : uv >= 4 ? "紫外线中等" : "紫外线温和";
  const rainLabel = `降水概率 ${rainChance}%`;
  const windLabel = wind >= 20 ? "风感明显" : wind >= 12 ? "有些风" : "风力平稳";
  return [uvLabel, rainLabel, windLabel];
};

const buildRadarNote = (forecast) => {
  const rainChance = toRounded(forecast.daily.precipitation_probability_max[0] ?? 0);
  const wind = toRounded(forecast.current.wind_speed_10m);

  if (rainChance >= 60) {
    return "未来几小时有较明显降水信号，出门建议带伞并留意路面湿滑。";
  }
  if (wind >= 20) {
    return "短时降水概率不高，但风力偏大，沿海和高处体感会更凉。";
  }
  return "未来 2 小时没有明显强降水信号，天气节奏整体比较平稳。";
};

const buildLifeItems = (forecast, air) => {
  const current = forecast.current;
  const todayMax = toRounded(forecast.daily.temperature_2m_max[0]);
  const uv = Number(forecast.daily.uv_index_max?.[0] ?? 0);
  const rainChance = toRounded(forecast.daily.precipitation_probability_max[0] ?? 0);
  const aqi = Number(air?.current?.us_aqi ?? 0);

  const dressing =
    todayMax >= 30
      ? ["穿衣", "轻薄透气", "白天偏热，建议短袖或轻薄面料。"]
      : todayMax >= 20
        ? ["穿衣", "薄外套即可", "早晚微凉，中午体感更舒服。"]
        : ["穿衣", "建议加外套", "温差明显，早晚需要注意保暖。"];

  const umbrella =
    rainChance >= 50
      ? ["带伞", "建议随身", "今天降水概率不低，通勤时段更值得留意。"]
      : ["出行", "比较轻松", "今天整体天气平稳，外出安排相对从容。"];

  const sport =
    aqi <= 80
      ? ["运动", "适合户外", "空气质量不错，步行或慢跑体验更好。"]
      : ["运动", "建议适度", "空气质量一般，户外活动时间可以控制得短一点。"];

  const sun =
    uv >= 7
      ? ["防晒", "需要注意", "午间紫外线较强，帽子或防晒霜会更稳妥。"]
      : ["日照", "整体温和", "日照强度适中，体感更舒适。"];

  return [dressing, umbrella, sport, sun];
};

const buildTrendData = (forecast) => {
  const now = new Date(forecast.current.time);
  const hourlyTimes = forecast.hourly.time.map((value) => new Date(value));
  let startIndex = hourlyTimes.findIndex((time) => time >= now);
  if (startIndex === -1) {
    startIndex = 0;
  }

  const hourlyCards = forecast.hourly.time.slice(startIndex, startIndex + 12).map((time, index) => {
    const dataIndex = startIndex + index;
    const isDay = new Date(time).getHours() >= 6 && new Date(time).getHours() < 18;
    const [icon] = weatherInfo(forecast.hourly.weather_code[dataIndex], isDay);
    const precipitation = toRounded(forecast.hourly.precipitation_probability[dataIndex] ?? 0);
    return {
      label: formatClock(time),
      icon,
      temp: `${toRounded(forecast.hourly.temperature_2m[dataIndex])}°`,
      note: `降水 ${precipitation}%`,
    };
  });

  const trendIndexes = Array.from({ length: 8 }, (_, index) => Math.min(startIndex + index * 3, forecast.hourly.time.length - 1));
  return {
    hourlyCards,
    labels: trendIndexes.map((index) => formatClock(forecast.hourly.time[index])),
    tempSeries: trendIndexes.map((index) => Number(forecast.hourly.temperature_2m[index])),
    feelsSeries: trendIndexes.map((index) => Number(forecast.hourly.apparent_temperature[index])),
  };
};

const buildDailyItems = (forecast) =>
  forecast.daily.time.slice(0, 7).map((time, index) => {
    const [icon, text] = weatherInfo(forecast.daily.weather_code[index], true);
    return {
      label: formatDay(time, index),
      icon,
      text,
      range: `${toRounded(forecast.daily.temperature_2m_max[index])}° / ${toRounded(forecast.daily.temperature_2m_min[index])}°`,
    };
  });

const renderTrend = () => {
  if (!state.forecast) {
    return;
  }

  const trend = buildTrendData(state.forecast);
  const series = state.trendMode === "feels" ? trend.feelsSeries : trend.tempSeries;
  const title = document.querySelector("[data-trend-title]");
  if (title) {
    title.textContent = state.trendMode === "feels" ? "未来 24 小时体感变化" : "未来 24 小时温度变化";
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const points = series.map((value, index) => {
    const x = 48 + (764 / (series.length - 1)) * index;
    const y = 220 - ((value - min) / (max - min || 1)) * 150;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  document.querySelector("[data-chart-line]").setAttribute("d", path);
  document.querySelector("[data-chart-area]").setAttribute("d", `${path} L 812 250 L 48 250 Z`);
  document.querySelector("[data-chart-dots]").innerHTML = points
    .map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5"></circle>`)
    .join("");
  document.querySelector("[data-trend-axis]").innerHTML = trend.labels.map((label) => `<span>${label}</span>`).join("");
};

const renderWeather = () => {
  const forecast = state.forecast;
  const air = state.air;
  if (!forecast) {
    return;
  }

  const current = forecast.current;
  const [icon, label] = weatherInfo(current.weather_code, current.is_day === 1);
  const location = state.location;
  const cityLabel = [location.name, location.admin1, location.country].filter(Boolean).join("，");
  const tags = buildTags(forecast);
  const trend = buildTrendData(forecast);
  const dailyItems = buildDailyItems(forecast);
  const lifeItems = buildLifeItems(forecast, air);
  const aqiValue = Number(air?.current?.us_aqi ?? 0);

  const setText = (field, value) => {
    const node = document.querySelector(`[data-field="${field}"]`);
    if (node) {
      node.textContent = value;
    }
  };

  setText("cityLabel", cityLabel);
  setText("updateTime", `更新于 ${formatClock(current.time)}`);
  setText("condition", label);
  setText("icon", icon);
  setText("temp", `${toRounded(current.temperature_2m)}°`);
  setText("feelsLike", `体感 ${toRounded(current.apparent_temperature)}°`);
  setText("summary", buildSummary(forecast));
  setText("tagA", tags[0]);
  setText("tagB", tags[1]);
  setText("tagC", tags[2]);
  setText("wind", `${toRounded(current.wind_speed_10m)} 公里/小时`);
  setText("humidity", `${toRounded(current.relative_humidity_2m)}%`);
  setText("visibility", kmText(current.visibility));
  setText("pressure", `${toRounded(current.pressure_msl)} 百帕`);
  setText("radarNote", buildRadarNote(forecast));
  setText("aqiValue", aqiValue ? String(toRounded(aqiValue)) : "--");
  setText("aqiLabel", aqiValue ? aqiLevel(aqiValue) : "暂无");
  setText("aqiText", aqiValue ? aqiCopy(aqiValue) : "暂时没有获取到空气质量数据。");
  setText("sunrise", formatClock(forecast.daily.sunrise[0]));
  setText("sunset", formatClock(forecast.daily.sunset[0]));
  setText("sunText", `今天最高 ${toRounded(forecast.daily.temperature_2m_max[0])}°，最低 ${toRounded(forecast.daily.temperature_2m_min[0])}°。`);

  document.querySelector("[data-hourly-list]").innerHTML = trend.hourlyCards
    .map(
      (item) => `
        <article class="hour-card">
          <span>${item.label}</span>
          <div class="icon">${item.icon}</div>
          <strong>${item.temp}</strong>
          <em>${item.note}</em>
        </article>
      `
    )
    .join("");

  document.querySelector("[data-daily-list]").innerHTML = dailyItems
    .map(
      (item) => `
        <article class="daily-item">
          <span>${item.label}</span>
          <div>
            <strong>${item.text}</strong>
            <span class="daily-icon">${item.icon}</span>
          </div>
          <div class="temp-range">${item.range}</div>
        </article>
      `
    )
    .join("");

  document.querySelector("[data-life-list]").innerHTML = lifeItems
    .map(
      (item) => `
        <article class="life-item">
          <span>${item[0]}</span>
          <strong>${item[1]}</strong>
          <p>${item[2]}</p>
        </article>
      `
    )
    .join("");

  renderTrend();
};

const setLoading = (message) => {
  const label = document.querySelector('[data-field="cityLabel"]');
  if (label) {
    label.textContent = message;
  }
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }
  return response.json();
};

const loadLocationWeather = async (location) => {
  setLoading(`${location.name} · 正在读取实时天气`);
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&timezone=auto&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,pressure_msl,wind_speed_10m,visibility,is_day` +
    `&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m,visibility` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&forecast_days=7`;
  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&timezone=auto&current=us_aqi,pm2_5`;

  const [forecast, air] = await Promise.all([fetchJson(forecastUrl), fetchJson(airUrl)]);
  state.location = location;
  state.forecast = forecast;
  state.air = air;
  renderWeather();
};

const activatePreset = async (key) => {
  state.cityKey = key;
  document.querySelectorAll("[data-city]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.city === key);
  });
  await loadLocationWeather(presetCities[key]);
};

const searchLocation = async (keyword) => {
  const normalized = keyword.endsWith("市") ? keyword : `${keyword}市`;
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalized)}` +
    `&count=5&language=zh&format=json`;
  const result = await fetchJson(url);
  if (!result.results || !result.results.length) {
    throw new Error("没有找到对应城市");
  }

  const match = result.results.find((item) => item.country === "中国") || result.results[0];
  const presetMatch = Object.entries(presetCities).find(([, city]) => city.name === match.name || city.name === keyword);

  if (presetMatch) {
    await activatePreset(presetMatch[0]);
    return;
  }

  state.cityKey = "";
  document.querySelectorAll("[data-city]").forEach((button) => button.classList.remove("is-active"));
  await loadLocationWeather({
    name: match.name,
    latitude: match.latitude,
    longitude: match.longitude,
    country: match.country,
    admin1: match.admin1,
  });
};

const setupCities = () => {
  document.querySelectorAll("[data-city]").forEach((button) => {
    button.addEventListener("click", () => {
      activatePreset(button.dataset.city).catch((error) => {
        setLoading(error.message);
      });
    });
  });

  const input = document.querySelector("[data-search-input]");
  const searchButton = document.querySelector("[data-search-button]");
  const runSearch = () => {
    const value = input.value.trim();
    if (!value) {
      return;
    }
    searchLocation(value).catch((error) => {
      setLoading(error.message);
    });
  };

  searchButton.addEventListener("click", runSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });

  activatePreset("beijing").catch((error) => {
    setLoading(error.message);
  });
};

const setupTrendSwitch = () => {
  const buttons = document.querySelectorAll("[data-trend-mode]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      state.trendMode = button.dataset.trendMode;
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderTrend();
    });
  });
};

const setupTheme = () => {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    document.body.classList.toggle("theme-light");
    const isLight = document.body.classList.contains("theme-light");
    button.classList.toggle("is-light", isLight);
    button.textContent = isLight ? "浅色主题" : "夜色主题";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  reveal();
  setupTrendSwitch();
  setupCities();
  setupTheme();
});
