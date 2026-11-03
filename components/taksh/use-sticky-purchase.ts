'use client';
import {useEffect,useState,type RefObject} from 'react';
export function useStickyPurchase(buy:RefObject<HTMLElement|null>,_contact:RefObject<HTMLElement|null>,_hideAtFooter=true){
 void _contact;void _hideAtFooter;
 const[sticky,setSticky]=useState(false),[headerHeight,setHeaderHeight]=useState(90);
 useEffect(()=>{const header=document.querySelector('.header'),button=buy.current;if(!header||!button)return;let observer:IntersectionObserver|undefined;
 // Extend the bottom boundary so a fast jump from below the viewport to above
 // the header still crosses the observed boundary and updates the bar.
 const observe=()=>{observer?.disconnect();const height=header.getBoundingClientRect().height;setHeaderHeight(height);setSticky(button.getBoundingClientRect().bottom<=height);observer=new IntersectionObserver(entries=>{const entry=entries[0];if(entry)setSticky(entry.boundingClientRect.bottom<=height)},{rootMargin:`-${height}px 0px 100000px 0px`,threshold:[0,1]});observer.observe(button)};
 observe();const resize=new ResizeObserver(observe);resize.observe(header);window.addEventListener('resize',observe);return()=>{observer?.disconnect();resize.disconnect();window.removeEventListener('resize',observe)};
 },[buy]);return{sticky,headerHeight};
}
