
/* update the display of element
*  @param { Object } element - Element object from click event, used to toggle
*                   display state
*/
export function toggleElementDisplay(thisEle, elements){

  elements.map(ele =>{
    const name = ele.replace('main_nav_','');
    const tab_ele = document.querySelector(`[ref="tab-${name}"]`);
    const mapClass = tab_ele.className;
    const newMapClass =   (mapClass.indexOf(' d-none') > 0) ? mapClass + ' ' :  mapClass + 'd-none';
    console.log(name, newMapClass)

    tab_ele.className = newMapClass
  });

  //let element = document.querySelector(`[ref="tab-${elementName}"]`);
  //console.log(`[ref="tab_${elementName}"]`)
  // const mapClass = thisEle.componentElem.className;
  // console.log(thisEle)
  // if(mapClass.indexOf(' d-none') > 0){
  //   console.log('here')
  //   element.className = mapClass.replace(' d-none','');
  // } else {
  //   console.log('not here')
  //
  //   element.className = mapClass + ' d-none';
  // }

  // return element
}
