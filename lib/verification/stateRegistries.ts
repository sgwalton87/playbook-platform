/** State office links from NASS corporate-registration directory, checked 2026-10-28. */
export const STATE_REGISTRIES = [
  {
    "name": "Alaska",
    "url": "https://www.commerce.alaska.gov/web/cbpl/Corporations.aspx"
  },
  {
    "name": "Alabama",
    "url": "https://www.alabamainteractive.org/sos/welcome.action"
  },
  {
    "name": "Arizona",
    "url": "https://www.azcc.gov/"
  },
  {
    "name": "Arkansas",
    "url": "https://www.sos.arkansas.gov/business-commercial-services-bcs"
  },
  {
    "name": "California",
    "url": "https://bizfileonline.sos.ca.gov/search/business"
  },
  {
    "name": "Colorado",
    "url": "https://www.sos.state.co.us/pubs/business/main.html"
  },
  {
    "name": "Connecticut",
    "url": "https://portal.ct.gov/SOTS/Business-Services/BSD"
  },
  {
    "name": "Delaware",
    "url": "https://corp.delaware.gov/"
  },
  {
    "name": "District of Columbia",
    "url": "https://dcra.dc.gov/page/corporation-services-0"
  },
  {
    "name": "Florida",
    "url": "https://sunbiz.org/"
  },
  {
    "name": "Georgia",
    "url": "https://sos.ga.gov/index.php/corporations"
  },
  {
    "name": "Hawaii",
    "url": "https://cca.hawaii.gov/breg/"
  },
  {
    "name": "Idaho",
    "url": "https://sosbiz.idaho.gov/"
  },
  {
    "name": "Illinois",
    "url": "https://www.ilsos.gov/departments/business_services/home.html"
  },
  {
    "name": "Indiana",
    "url": "https://inbiz.in.gov/BOS/Home/Index"
  },
  {
    "name": "Iowa",
    "url": "https://sos.iowa.gov/business/FormsAndFees.html"
  },
  {
    "name": "Kansas",
    "url": "https://sos.ks.gov/businesses/register-a-business.html"
  },
  {
    "name": "Kentucky",
    "url": "https://www.sos.ky.gov/bus/Pages/default.aspx"
  },
  {
    "name": "Louisiana",
    "url": "https://www.sos.la.gov/business-services/start-a-business"
  },
  {
    "name": "Maine",
    "url": "https://www.maine.gov/sos/cec/corp/index.html"
  },
  {
    "name": "Maryland",
    "url": "https://egov.maryland.gov/BusinessExpress/Account/LogOn?ReturnUrl=%2fBusinessExpress%2fUBD%2fCreate"
  },
  {
    "name": "Massachusetts",
    "url": "https://www.sec.state.ma.us/divisions/corporations/corporations.htm"
  },
  {
    "name": "Michigan",
    "url": "https://www.michigan.gov/lara/0,4601,7-154-61343_35413---,00.html"
  },
  {
    "name": "Minnesota",
    "url": "https://sos.mn.gov/business-liens/start-a-business/how-to-register-your-business/"
  },
  {
    "name": "Mississippi",
    "url": "https://www.ms.gov/sos/onestopshop"
  },
  {
    "name": "Missouri",
    "url": "https://www.sos.mo.gov/business/corporations/"
  },
  {
    "name": "Montana",
    "url": "https://sosmt.gov/business/"
  },
  {
    "name": "Nebraska",
    "url": "https://www.sos.state.ne.us/business/corp_serv/"
  },
  {
    "name": "Nevada",
    "url": "https://www.nvsos.gov/sos/businesses"
  },
  {
    "name": "New Hampshire",
    "url": "https://www.sos.nh.gov/corporations-0/"
  },
  {
    "name": "New Jersey",
    "url": "https://www.state.nj.us/treasury/taxation/br1.shtml"
  },
  {
    "name": "New Mexico",
    "url": "https://enterprise.sos.nm.gov/"
  },
  {
    "name": "New York",
    "url": "https://www.dos.ny.gov/corps/bus_entity_search.html"
  },
  {
    "name": "North Carolina",
    "url": "https://www.sosnc.gov/divisions/business_registration"
  },
  {
    "name": "North Dakota",
    "url": "https://www.nd.gov/sos/businessserv/"
  },
  {
    "name": "Ohio",
    "url": "https://www.ohiosos.gov/business"
  },
  {
    "name": "Oklahoma",
    "url": "https://www.sos.ok.gov/business/default.aspx"
  },
  {
    "name": "Oregon",
    "url": "https://www.filinginoregon.com/"
  },
  {
    "name": "Pennsylvania",
    "url": "https://file.dos.pa.gov/"
  },
  {
    "name": "Puerto Rico",
    "url": "https://prcorpfiling.f1hst.com/CorporationSearch.aspx"
  },
  {
    "name": "Rhode Island",
    "url": "https://www.sos.ri.gov/divisions/business-services"
  },
  {
    "name": "South Carolina",
    "url": "https://sos.sc.gov/online-filings/business-entities"
  },
  {
    "name": "South Dakota",
    "url": "https://sdsos.gov/business-services/corporations/default.aspx"
  },
  {
    "name": "Tennessee",
    "url": "https://sos.tn.gov/business-services"
  },
  {
    "name": "Texas",
    "url": "https://www.sos.state.tx.us/corp/index.shtml"
  },
  {
    "name": "Utah",
    "url": "https://corporations.utah.gov/"
  },
  {
    "name": "Vermont",
    "url": "https://sos.vermont.gov/business-services/business-filings/domestic-formation/"
  },
  {
    "name": "Virginia",
    "url": "https://www.scc.virginia.gov/businesses/"
  },
  {
    "name": "Washington",
    "url": "https://www.sos.wa.gov/corps/"
  },
  {
    "name": "West Virginia",
    "url": "https://business4.wv.gov/startmybusiness/pages/register-your-business.aspx"
  },
  {
    "name": "Wisconsin",
    "url": "https://apps.dfi.wi.gov/apps/CorpSearch/Search.aspx"
  },
  {
    "name": "Wyoming",
    "url": "https://soswy.state.wy.us/Business/Business.aspx"
  }
] as const;
export function registryForState(name: string) { return STATE_REGISTRIES.find(row => row.name.toLowerCase() === name.trim().toLowerCase()) ?? null; }
