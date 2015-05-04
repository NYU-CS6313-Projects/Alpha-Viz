require 'rubygems'
require 'yahoo_finance' #https://github.com/herval/yahoo-finance

##
# List of all the fields
 # :after_hours_change_real_time
 # :annualized_gain 
 # :ask
 # :ask_real_time
 # :ask_size
 # :average_daily_volume
 # :bid
 # :bid_real_time
 # :bid_size
 # :book_value
 # :change
 # :change_and_percent_change
 # :change_from_200_day_moving_average 
 # :change_from_50_day_moving_average 
 # :change_from_52_week_high 
 # :change_From_52_week_low 
 # :change_in_percent 
 # :change_percent_realtime 
 # :change_real_time
 # :close 
 # :comission
 # :day_value_change 
 # :day_value_change_realtime 
 # :days_range
 # :days_range_realtime 
 # :dividend_pay_date 
 # :dividend_per_share
 # :dividend_yield
 # :earnings_per_share
 # :ebitda 
 # :eps_estimate_current_year 
 # :eps_estimate_next_quarter 
 # :eps_estimate_next_year 
 # :error_indicator 
 # :ex_dividend_date
 # :float_shares 
 # :high 
 # :high_52_weeks 
 # :high_limit 
 # :holdings_gain 
 # :holdings_gain_percent 
 # :holdings_gain_percent_realtime 
 # :holdings_gain_realtime 
 # :holdings_value 
 # :holdings_value_realtime 
 # :last_trade_date
 # :last_trade_price
 # :last_trade_realtime_withtime 
 # :last_trade_size 
 # :last_trade_time 
 # :last_trade_with_time 
 # :low 
 # :low_52_weeks 
 # :low_limit 
 # :market_cap_realtime 
 # :market_capitalization 
 # :more_info 
 # :moving_average_200_day 
 # :moving_average_50_day 
 # :name 
 # :notes 
 # :one_year_target_price 
 # :open 
 # :order_book 
 # :pe_ratio 
 # :pe_ratio_realtime 
 # :peg_ratio 
 # :percent_change_from_200_day_moving_average 
 # :percent_change_from_50_day_moving_average 
 # :percent_change_from_52_week_high 
 # :percent_change_from_52_week_low 
 # :previous_close 
 # :price_eps_estimate_current_year 
 # :price_eps_Estimate_next_year 
 # :price_paid 
 # :price_per_book 
 # :price_per_sales 
 # :shares_owned 
 # :short_ratio 
 # :stock_exchange 
 # :symbol 
 # :ticker_trend 
 # :trade_date
 # :trade_links 
 # :volume
 # :weeks_range_52
##

# query stock of the latest day
data = YahooFinance.quotes(["AAPL"], [:symbol, :ask, :bid, :last_trade_date])
puts data[0].symbol + " value is: " + data[0].ask + " -- " + data[0].last_trade_date
puts data.size

# qurery historical price
data2 = YahooFinance.historical_quotes("AAPL", { raw: false, period: :daily })
data3 = YahooFinance.historical_quotes("AAPL", start_date: Time::new(2014,01,01), end_date: Time::new(2014,12,31))
puts data3.size
data3.each do |s|
    puts s.symbol + " value is: " + s.close + " -- " + s.trade_date
end