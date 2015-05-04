require 'csv'

data = CSV.read('daily_2014_clean.csv', headers: true)
CSV.open('daily_2014_final.csv', 'w') do |csv|
  csv << ['date','entity','avgASenti','avgImpSc']
  data.each do |row|
    csv << [row[0]+"-"+row[1]+"-"+row[2], row[3], row[4], row[5]]
  end
end
