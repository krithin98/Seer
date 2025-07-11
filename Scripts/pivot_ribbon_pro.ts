# Saty Pivot Ribbon Pro
# Copyright (C) 2022-2025 Saty Mahajan
#
# A Moving Average Ribbon system that simplifies measuring and using Moving Averages for trend and support/resistance.
# Special thanks to Ripster (@ripster47) for his education and EMA Clouds which inspired this indicator.

# Settings
input Time_Warp = {default "off", "1m", "2m", "3m", "4m", "5m", "10m", "15m", "20m", "30m", "1h", "2h", "4h", "D", "W", "M", "Y"};
input Fast_EMA = 8;
input Highlight_Fast = no;
input Show_Pullback_Overlap = yes;
input Pullback_Overlap_EMA = 13;
input Highlight_Pullback_Overlap_EMA = no;
input Pivot_EMA = 21;
input Highlight_Pivot = yes;
input Show_Pivot_Bias = yes;
input Pivot_Bias_EMA = 8;
input Slow_EMA = 48;
input Highlight_Slow = no;
input Show_Candle_Bias = yes;
input Candle_Bias_EMA = 48;
input Show_Conviction_Arrows = yes;
input Conviction_Arrow_Size = 2;
input Show_Fast_Conviction_EMA = no;
input Fast_Conviction_EMA = 13;
input Show_Slow_Conviction_EMA = no;
input Slow_Conviction_EMA = 48;
input Show_Long_Term_Trend = yes;
input Long_Term_Trend_EMA = 200;
input Show_Long_Term_Trend_Bias = yes;
input Long_Term_Trend_Bias_EMA = 21;

# Time Warp
def price;
switch (Time_Warp) {
case "off":
    price = close;
case "1m":
    price = close(period = AggregationPeriod.MIN);
case "2m":
    price = close(period = AggregationPeriod.TWO_MIN);
case "3m":
    price = close(period = AggregationPeriod.THREE_MIN);
case "4m":
    price = close(period = AggregationPeriod.FOUR_MIN);
case "5m":
    price = close(period = AggregationPeriod.FIVE_MIN);
case "10m":
    price = close(period = AggregationPeriod.TEN_MIN);
case "15m":
    price = close(period = AggregationPeriod.FIFTEEN_MIN);
case "20m":
    price = close(period = AggregationPeriod.TWENTY_MIN);
case "30m":
    price = close(period = AggregationPeriod.THIRTY_MIN);
case "1h":
    price = close(period = AggregationPeriod.HOUR);
case "2h":
    price = close(period = AggregationPeriod.TWO_HOURS);
case "4h":
    price = close(period = AggregationPeriod.FOUR_HOURS);
case "D":
    price = close(period = AggregationPeriod.DAY);
case "W":
    price = close(period = AggregationPeriod.WEEK);
case "M":
    price = close(period = AggregationPeriod.MONTH);
case "Y":
    price = close(period = AggregationPeriod.YEAR);
}

# Calculations
def Fast_Value = ExpAverage(price, Fast_EMA);
def Pullback_Value = ExpAverage(price, Pullback_Overlap_EMA);
def Pivot_Value = ExpAverage(price, Pivot_EMA);
def Pivot_Bias_Value = ExpAverage(price, Pivot_Bias_EMA);
def Slow_Value = ExpAverage(price, Slow_EMA);
def Fast_Conviction_Value = ExpAverage(price, Fast_Conviction_EMA);
def Slow_Conviction_Value = ExpAverage(price, Slow_Conviction_EMA);
def Long_Term_Value = ExpAverage(price, Long_Term_Trend_EMA);
def Long_Term_Bias_Value = ExpAverage(price, Long_Term_Trend_Bias_EMA);

# Add Clouds
DefineGlobalColor("Fast Long", Color.GREEN);
DefineGlobalColor("Fast Short", Color.RED);
AddCloud(Fast_Value, Pivot_Value, GlobalColor("Fast Long"), GlobalColor("Fast Short"));

DefineGlobalColor("Slow Long", Color.CYAN);
DefineGlobalColor("Slow Short", Color.LIGHT_ORANGE);
AddCloud(if Show_Pullback_Overlap then Pullback_Value else Pivot_Value, Slow_Value, GlobalColor("Slow Long"), GlobalColor("Slow Short"));

# Add Fast Plot
DefineGlobalColor("Fast Highlight", Color.GRAY);
plot Fast = if Highlight_Fast then Fast_Value else Double.NaN;
Fast.AssignValueColor(GlobalColor("Fast Highlight"));

# Add Pullback Plot
DefineGlobalColor("Pullback Highlight", Color.GRAY);
plot Pullback = if Show_Pullback_Overlap and Highlight_Pullback_Overlap_EMA then Pullback_Value else Double.NaN;
Pullback.AssignValueColor(GlobalColor("Pullback Highlight"));

# Add Pivot Plot
DefineGlobalColor("Pivot Highlight", Color.LIGHT_GRAY);
plot Pivot = if Highlight_Pivot or Show_Pivot_Bias then Pivot_Value else Double.NaN;
Pivot.AssignValueColor(if Show_Pivot_Bias then (if Pivot_Bias_Value >= Pivot_Value then Color.GREEN else Color.RED) else GlobalColor("Pivot Highlight"));

# Add Slow Plot
DefineGlobalColor("Slow Highlight", Color.GRAY);
plot Slow = if Highlight_Slow then Slow_Value else Double.NaN;
Slow.AssignValueColor(GlobalColor("Slow Highlight"));

# Add Long-Term EMA
DefineGlobalColor("Long-term EMA", Color.DARK_GRAY);
plot Long_Term = if Show_Long_Term_Trend then Long_Term_Value else Double.NaN;
Long_Term.AssignValueColor(if Show_Long_Term_Trend_Bias then (if Long_Term_Bias_Value >= Long_Term_Value then Color.CYAN else Color.LIGHT_ORANGE) else GlobalColor("Long-term EMA"));

# Conviction Arrows 
DefineGlobalColor("Bullish Conviction Arrow", Color.CYAN);
DefineGlobalColor("Bearish Conviction Arrow", Color.LIGHT_ORANGE);
def bullish_conviction = Fast_Conviction_Value >= Slow_Conviction_Value;
def bearish_conviction = Fast_Conviction_Value < Slow_Conviction_Value;
def bullish_conviction_confirmed = (bullish_conviction == yes and bullish_conviction[1] == no);
def bearish_conviction_confirmed = (bearish_conviction == yes and bearish_conviction[1] == no);
plot bullish_conviction_signal = if bullish_conviction_confirmed and Show_Conviction_Arrows then price else Double.NaN;
plot bearish_conviction_signal = if bearish_conviction_confirmed and Show_Conviction_Arrows then price else Double.NaN;
bullish_conviction_signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_WEDGE_UP);
bullish_conviction_signal.AssignValueColor(GlobalColor("Bullish Conviction Arrow"));
bullish_conviction_signal.SetLineWeight(Conviction_Arrow_Size);
bullish_conviction_signal.HideBubble();
bearish_conviction_signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_WEDGE_DOWN);
bearish_conviction_signal.AssignValueColor(GlobalColor("Bearish Conviction Arrow"));
bearish_conviction_signal.SetLineWeight(Conviction_Arrow_Size);
bearish_conviction_signal.HideBubble();
plot fast_conviction_ema_signal = if Show_Fast_Conviction_EMA then Fast_Conviction_Value else Double.NaN;
fast_conviction_ema_signal.SetDefaultColor(Color.LIGHT_GRAY);
plot slow_conviction_ema_signal = if Show_Slow_Conviction_EMA then Slow_Conviction_Value else Double.NaN;
slow_conviction_ema_signal.SetDefaultColor(Color.MAGENTA);

# Show Candle Bias
def Candle_Bias_Value = ExpAverage(price, Candle_Bias_EMA);
def above_candle_bias = close >= Candle_Bias_Value;
def below_candle_bias = close < Candle_Bias_Value;
def up = open < close;
def doji = open == close;
def down = open > close;
AssignPriceColor(if above_candle_bias and up and Show_Candle_Bias then GlobalColor("Fast Long") else if below_candle_bias and up and Show_Candle_Bias then GlobalColor("Slow Short") else if above_candle_bias and down and Show_Candle_Bias then GlobalColor("Slow Long") else if below_candle_bias and down and Show_Candle_Bias then GlobalColor("Fast Short") else if doji and Show_Candle_Bias then Color.GRAY else Color.CURRENT); 