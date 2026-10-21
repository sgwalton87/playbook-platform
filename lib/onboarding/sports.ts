// Recovered from e4e703b^:app/onboarding/page.tsx; introduced in f79cb8f.
export const SPORT_CONFIG: Record<string, { label: string; options: string[] }>={
  "Basketball":{label:"Position",options:["Point Guard","Shooting Guard","Small Forward","Power Forward","Center","Guard","Forward","Guard-Forward","Forward-Center"]},
  "Football":{label:"Position",options:["Quarterback","Running Back","Fullback","Wide Receiver","Tight End","Offensive Lineman","Defensive End","Defensive Tackle","Linebacker","Cornerback","Safety","Kicker","Punter","Returner"]},
  "Soccer":{label:"Position",options:["Goalkeeper","Center Back","Right Back","Left Back","Defensive Midfielder","Central Midfielder","Attacking Midfielder","Right Winger","Left Winger","Striker","Forward"]},
  "Baseball":{label:"Position",options:["Pitcher","Catcher","First Base","Second Base","Third Base","Shortstop","Left Field","Center Field","Right Field","Designated Hitter","Utility"]},
  "Softball":{label:"Position",options:["Pitcher","Catcher","First Base","Second Base","Third Base","Shortstop","Left Field","Center Field","Right Field","Designated Player","Utility"]},
  "Track & Field":{label:"Event",options:["100m","200m","400m","800m","1500m","Mile","5000m","10000m","110m Hurdles","100m Hurdles","400m Hurdles","3000m Steeplechase","4x100m Relay","4x400m Relay","High Jump","Pole Vault","Long Jump","Triple Jump","Shot Put","Discus","Hammer Throw","Javelin","Heptathlon","Decathlon","Cross Country","Race Walk"]},
  "Swimming":{label:"Event",options:["50m Freestyle","100m Freestyle","200m Freestyle","400m Freestyle","800m Freestyle","1500m Freestyle","100m Backstroke","200m Backstroke","100m Breaststroke","200m Breaststroke","100m Butterfly","200m Butterfly","200m IM","400m IM","4x100m Relay","4x200m Relay","4x100m Medley Relay","Open Water"]},
  "Volleyball":{label:"Position",options:["Setter","Outside Hitter","Middle Blocker","Opposite Hitter","Libero","Defensive Specialist","Serving Specialist"]},
  "Tennis":{label:"Specialty",options:["Singles","Doubles","Mixed Doubles","All-around"]},
  "Cross Country":{label:"Distance",options:["5K","6K","8K","10K","All distances"]},
  "Wrestling":{label:"Weight class",options:["106 lbs","113 lbs","120 lbs","126 lbs","132 lbs","138 lbs","144 lbs","150 lbs","157 lbs","165 lbs","175 lbs","190 lbs","215 lbs","285 lbs"]},
  "Lacrosse":{label:"Position",options:["Attack","Midfield","Defense","Goalkeeper","FOGO (Face-off)"]},
  "Golf":{label:"Format",options:["Stroke play","Match play","Team format","All formats"]},
  "Gymnastics":{label:"Event",options:["All-around","Floor Exercise","Vault","Uneven Bars","Balance Beam","Pommel Horse","Still Rings","Parallel Bars","High Bar","Trampoline","Rhythmic"]},
  "Cheer":{label:"Specialty",options:["Tumbling","Stunting","Jumps","Dance","Flyer","Base","Back Spot","All-around"]},
  "Dance":{label:"Style",options:["Hip Hop","Jazz","Contemporary","Ballet","Pom","Kick","Lyrical","Tap","Ballroom","Competitive All-Star"]},
  "Other":{label:"Position / Event",options:[]},
};

export const SPORT_OPTIONS = Object.keys(SPORT_CONFIG);
