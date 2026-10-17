// Continuous light fields: broad feathered colour, without opaque geometric edges.
export function modernLightComposition(recipe, palette) {
  const [base, one, two] = palette.colors;
  const position=recipe.position??0;
  const defs=`
    <linearGradient id="field" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${base}"/><stop offset="1" stop-color="${one}" stop-opacity=".38"/></linearGradient>
    <linearGradient id="light" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${one}" stop-opacity=".3"/><stop offset=".3" stop-color="${one}"/><stop offset=".6" stop-color="${two}"/><stop offset="1" stop-color="${one}" stop-opacity=".15"/></linearGradient>
    <linearGradient id="falloff" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${two}" stop-opacity=".9"/><stop offset=".5" stop-color="${one}" stop-opacity=".8"/><stop offset="1" stop-color="${one}" stop-opacity="0"/></linearGradient>
    <filter id="atmosphere" filterUnits="userSpaceOnUse" x="-600" y="-600" width="2800" height="2100"><feGaussianBlur stdDeviation="125"/></filter>
    <filter id="feather" filterUnits="userSpaceOnUse" x="-600" y="-600" width="2800" height="2100"><feGaussianBlur stdDeviation="65"/></filter>`;
  const stroke=(path,color,width,filter='atmosphere',opacity=1)=>`<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" filter="url(#${filter})" opacity="${opacity}"/>`;
  let artwork;
  if(recipe.slug==='aurora') {
    artwork=stroke('M-220 900 C200 820 460 200 850 340 S1370 650 1810 -80',one,630)
      +stroke('M-150 1040 C250 1050 490 440 870 540 S1380 720 1740 160',two,350)
      +stroke('M-200 1080 C400 1050 650 500 980 610 S1490 650 1750 330','url(#light)',155,'feather',.8);
  } else if(recipe.slug==='centre-stage') {
    artwork=`<path d="M1160 -220 L1500 -220 L920 1170 L-190 1170Z" fill="url(#falloff)" filter="url(#atmosphere)"/>`
      +stroke('M1330 -160 C1080 210 920 540 470 980','url(#light)',360)
      +stroke('M1500 20 C1250 480 1190 690 1030 1100',one,300,'atmosphere',.6);
  } else if(recipe.family==='beam') {
    const paths=[
      'M-200 1040 C420 850 750 320 1760 80',
      'M-180 -60 C380 220 830 720 1780 1040',
      'M-160 800 C400 240 1020 260 1800 570',
      'M140 -200 C560 140 850 770 1510 1080',
      'M-220 560 C490 1000 900 200 1800 170',
    ];
    const path=paths[position];
    artwork=stroke(path,one,630)+stroke(path,'url(#light)',285,'feather')
      +stroke(`M-160 ${100+position*130} Q780 ${980-position*150} 1780 ${710-position*140}`,two,360,'atmosphere',.4);
  } else if(recipe.family==='orb') {
    const paths=[
      'M-180 920 C400 1060 230 60 900 240 S1260 1100 1790 560',
      'M-180 300 C500 -180 420 970 1030 680 S1450 -160 1800 340',
      'M-150 900 C310 300 660 140 1020 460 S1360 1020 1790 360',
      'M-140 230 C420 850 730 930 1030 290 S1500 340 1790 650',
      'M-160 800 C190 -80 780 220 840 620 S1450 780 1800 80',
    ];
    artwork=stroke(paths[position],one,740)
      +stroke(paths[(position+2)%5],two,430,'atmosphere',.9)
      +stroke(paths[position],'url(#light)',210,'feather',.65);
  } else if(recipe.family==='arch') {
    const paths=[
      'M-250 1070 C70 700 150 -70 820 190 S1330 990 1820 540',
      'M-240 330 C260 840 510 1030 900 440 S1420 -130 1840 350',
      'M-240 1060 C280 130 490 260 1010 450 S1380 50 1830 -60',
      'M-190 -80 C200 350 370 970 970 710 S1440 370 1810 1040',
      'M-230 880 C290 1100 370 -140 1030 190 S1380 1020 1840 410',
    ];
    artwork=stroke(paths[position],one,680)
      +stroke(paths[position],'url(#light)',320,'feather')
      +stroke(paths[(position+1)%5],two,390,'atmosphere',.35);
  } else throw new Error(`Unknown light composition: ${recipe.slug}`);
  return {background:undefined,defs,content:`<rect width="1600" height="900" fill="${base}"/><rect width="1600" height="900" fill="url(#field)"/>${artwork}`};
}
