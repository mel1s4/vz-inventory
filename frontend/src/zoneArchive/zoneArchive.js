import React, { useState, useEffect, useRef, use } from 'react';
import { __ } from '../translations';
import './zoneArchive.scss';
// import api from '../api';	
import axios from 'axios';

function ZoneArchive () {
  const devEnv = true;
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZoneVariable] = useState(null);
  const productInputRef = useRef(null);
  const zoneInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProductVariable] = useState(null);
  const [parentId, setParentId] = useState(0);
  const [breadcrum, setBreadcrum] = useState([]);
  const [parentZoneTitle, setParentZoneTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [restNonce, setRestNonce] = useState('');
  const [restUrl, setRestUrl] = useState(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [productInputMode, setProductInputMode] = useState('numeric');
  const productTitleInputRef = useRef(null);


  function setSelectedZone(zone) {
    setSelectedZoneVariable(zone);
    setSelectedProductVariable(null);
  }
  function setSelectedProduct(product) {
    setSelectedProductVariable(product);
    setSelectedZoneVariable(null);
  }

  const api = {
    restUrl: () => {
      if (devEnv) {
        return 'http://localhost/wp-json/';
      }
      return restUrl;
    },
    headers: () => {

      if (devEnv) {
        return {
          'Content-Type': 'application/json',
        }
      }

      return {
        'Content-Type': 'application/json',
        'X-WP-Nonce': restNonce
      }
    },
    get: async (url, params) => {
      const headers = api.headers();
      return axios.get(`${api.restUrl()}vz-inventory/v1/${url}`, {
        headers,
        params
      });
    },
    post: async (url, data) => {
      const headers = api.headers();
      return axios.post(`${api.restUrl()}vz-inventory/v1/${url}`, data, {
        headers,
      });
    },
    put: async (url, data) => {
      const headers = api.headers();
      return axios.put(`${api.restUrl()}vz-inventory/v1/${url}`, data, {
        headers,
      });
    },
    delete: async (url, params) => {
      const headers = api.headers();
      return axios.delete(`${api.restUrl()}vz-inventory/v1/${url}`, {
        headers,
        params
      });
    }
  };

  function VzIcon({icon='edit'}) {
    return (
      <span className="icon">
        <img src={
          `${srcUrl}/icons/icon_${icon}.svg`
        } alt={icon} />
      </span>
    );
  }

  async function handleProductUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const sku = selectedProduct.sku;
      const result = await api.post(`product/${selectedProduct.id}`, { 
        sku,
        title: selectedProduct.title,
        zone_id: parentId,
       });
       if (result.data.error) {
         console.error(result.data.error);
         return;
       }
       console.log(result);
      const nProduct = result.data.product;
      if (selectedProduct.id === 'new') {
        setProducts([...products, nProduct]);
      } else {
        const nProducts = products.map(product => {
          if (product.id === selectedProduct.id) {
            return nProduct;
          }
          return product;
        });
        setProducts(nProducts);
      }
      addProduct();
      setLoading(false);
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
    
  }

  function handleselectedProductSku(e) {
    e.preventDefault();
    const nselectedProduct = {
      ...selectedProduct,
      sku: e.target.value,
    }
    setSelectedProduct(nselectedProduct);
  }

  function handleselectedProductTitle(e) {
    e.preventDefault();
    const nselectedProduct = {
      ...selectedProduct,
      title: e.target.value,
    }
    setSelectedProduct(nselectedProduct);
  }

  function editProduct(productId) {
    const nSelected = products.find(product => product.id === productId);
    setSelectedProduct(nSelected);
    console.log(nSelected);
  }

  function addProduct() {
    const exampleProduct = {
      id: 'new',
      post_title: '',
      sku: '',
    };
    setSelectedProduct(exampleProduct);
  }

  async function addZone() {
    const exampleZone = {
      id: 'new',
      post_title: '',
      color: '#000000',
    };
    setSelectedZone(exampleZone);
  }
  
  function getZoneLink(zoneId) {
    const previousUrlParams = new URLSearchParams(window.location.search);
    if (zoneId === 'home') {
      previousUrlParams.delete('parent_id');
    } else {
      previousUrlParams.set('parent_id', zoneId);
    }
    return `${window.location.pathname}?${previousUrlParams.toString()}`;
  }

  function handleSelectedZoneName(e) {
    e.preventDefault();
    const post_title = e.target.value;
    const nSelectedZone = {
      ...selectedZone,
      post_title,
    }
    setSelectedZone(nSelectedZone);   
  }


  function editZone(e, zoneId) {
    console.log(zoneId);
    e.preventDefault();
    const nSelected = zones.find(zone => zone.id === zoneId);
    setSelectedZone(nSelected);
  }

  useEffect(() => {
    if(window.vz_app_params) {
      setRestNonce(window.vz_app_params.rest_nonce);
      setRestUrl(window.vz_app_params.rest_url);

      if (window.vz_app_params.results) {
        setZones(window.vz_app_params.results.zones);
        setProducts(window.vz_app_params.results.products);
        setBreadcrum(window.vz_app_params.results.breadcrumb);
        setParentZoneTitle(window.vz_app_params.results.title);
        setParentId(window.vz_app_params.results.parent_id);
        setSrcUrl(window.vz_app_params.src_url);
      }
      // get parent id from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const zone_id = urlParams.get('parent_id');
      if (zone_id) {
        setParentId(parseInt(zone_id));
      }
    }
    if (devEnv) {
      const uP = new URLSearchParams(window.location.search);
      const zid = parseInt(uP.get('parent_id')) || 0;
      fetchZones(zid);
    }
  }, []);

  async function fetchZones(zone_id = 0) { 
    const pID = zone_id || parentId;
    if (zone_id !== parentId) {
      setParentId(zone_id);
    }
    setLoading(true);
    try {
      const response = await api.get('zones', {
          parent_id: pID,
      });
      const data = response.data;
      console.log(data);
      if (data.zones) {
        setZones(data.zones);
      }
      if (data.products) {
        setProducts(data.products);
      }
      if (data.breadcrumb) {
        setBreadcrum(data.breadcrumb);
      }
      if (data.title) {
        setParentZoneTitle(data.title);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false); 
    }
    
  }
  
  async function handleZoneUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {
        post_title: selectedZone.post_title,
        parent_id: parentId,
        color: selectedZone.color
      };
        
      const response = await api.put(`zones/${selectedZone.id}`, params );

      if (response.data.error) {
        console.error(response.data.error);
        setLoading(false);
        return;
      }

      if (response.data.id) {
        let updatedZones;
        if (selectedZone.id === 'new') {
          updatedZones = [...zones, {
            id: response.data.id,
            post_title: selectedZone.post_title,
            color: selectedZone.color
          }];
          setZones(updatedZones);
        } else {
          updatedZones = zones.map(zone => {
            if (zone.id === selectedZone.id) {
              return {
                ...zone,
                post_title: selectedZone.post_title,
                color: selectedZone.color
              }
            }
            return zone;
          });
        }
        setZones(updatedZones);
      }
      setSelectedZone(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  async function deleteZone(zoneId) {
    if (!window.confirm(__('zone-delete-confirm'))) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`zones/${zoneId}`);
      console.log(response);
      const updatedZones = zones.filter(zone => zone.id !== zoneId);
      setZones(updatedZones);
      setSelectedZone(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  function handleSelectedZoneColor(e) {
    e.preventDefault();
    const color = e.target.value;
    const nSelectedZone = {
      ...selectedZone,
      color,
    }
    setSelectedZone(nSelectedZone);
  }

  async function deleteProduct() {
    if (!window.confirm(__('product-delete-confirm'))) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`product/${selectedProduct.id}`, {
        
          zone_id: parentId,
        
      });
      console.log(response);
      const updatedProducts = products.filter(product => product.id !== selectedProduct.id);
      setProducts(updatedProducts);
      setSelectedProduct(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  function productLink(productId) {
    return `${window.location.origin}/wp-admin/post.php?post=${productId}&action=edit`;
  }

  function toggleInputMode() {
    productInputRef.current.focus();
    setProductInputMode(productInputMode === 'numeric' ? 'text' : 'numeric');
  }

  function contrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 150) ? true : false;
  }

  function darken(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const B = (num >> 8 & 0x00FF) - amt;
    const G = (num & 0x0000FF) - amt;
    return `#${(0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1)}`;
  }

  function lighten(color, percent) {  
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = (num >> 8 & 0x00FF) + amt;
    const G = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (R > 255 ? 255 : R) * 0x10000 + (B > 255 ? 255 : B) * 0x100 + (G > 255 ? 255 : G)).toString(16).slice(1)}`;
  }

  function setColors(color) {
    return {
      backgroundColor: color,
      color: contrastColor(color) ? darken(color, 80) : lighten(color, 60),
      borderColor: darken(color, 20),
    }
  }

  return (
    <section className='vzi-zone-archive'>
      { loading && (
          <div className="vzi-loader">
            <p>
              Loading...
            </p>
          </div>
      )}
      <ul className="vzi-breadcrumb-list">
        <li>
        <a href={getZoneLink('home')}>Home</a>
        </li>
        {
          breadcrum.map((item, index) => (
            <li key={index}>
              <a href={getZoneLink(item.id)}>{item.title}</a>
            </li>
          ))
        }
      </ul>
      <h2>{ parentZoneTitle || 'Home' }</h2>
      <section className="vzi-zone-archive__form__wrapper">
        <div className="vzi-archive__actions">
          <button className="vzi-button add-zone"
                  onClick={addZone}>
            <VzIcon icon="add" />
              Zone
          </button>
          { (parentId > 0) && (
            <button className="vzi-button add-product"
                    onClick={addProduct}>
              <VzIcon icon="add_white" />
              Product
            </button>
          )}
        </div>
        { selectedZone && (
          <form onSubmit={(e) => handleZoneUpdate(e)} 
                className="vzi-zone-archive__form">
            <p className="vzi-form__title">
              { selectedZone.id === 'new' ? __('new-zone') : __('edit-zone') } Zone
            </p>
            <div className="vzi-form__container">                
              

              <label className="vzi-form__input__label">
                <input type="text" 
                      className="vzi-form__input"
                      name="name"
                      ref={zoneInputRef}
                      onChange={(e) => handleSelectedZoneName(e)}
                      value={selectedZone.post_title} />
              </label>

              <label>
                <input type="color"
                      name="color"
                      value={selectedZone?.color}
                      onChange={(e) => handleSelectedZoneColor(e)}
                       className="vzi-form__color-picker" />
              </label>
              
            </div>
            <div className="vzi-form__actions">
              {selectedZone.id !== 'new' && (
                <button type="button"
                        className="vzi-button vzi-zone-archive__delete"
                        onClick={() => deleteZone(selectedZone.id)}>
                  <VzIcon icon="delete" />
                  <span className="text-indented">
                    Delete
                  </span>
                </button>
              )}
              <button
                  className="vzi-button vzi-zone-archive__cancel"
                  type="button"
                  onClick={() => setSelectedZone(null)}>
                Cancel
              </button>
              
              <button type="submit"
                      className="vzi-button vzi-zone-archive__save">
                Save
              </button>
            </div>
          </form>
        )}
        {selectedProduct && (
          <form onSubmit={(e) => handleProductUpdate(e)} 
                className="vzi-zone-archive__form">
            <p className="vzi-form__title">
              {selectedProduct.id === 'new' ? __('add-product') : __('edit-product') }
            </p>
            <div className="vzi-form__container">
              <label className="vzi-form__input__label">
                <p> {__('product-title')} </p>
              <input type="text"
                      name="name"
                      className="vzi-form__input"
                      ref={productTitleInputRef}
                      onChange={(e) => handleselectedProductTitle(e)}
                      value={selectedProduct.title} />
              </label>
            </div>
            <div className="vzi-form__container">
              <label className="vzi-form__input__label">
                <p> {__('product-sku')} </p>
                <input type="text"
                      name="sku"
                      className="vzi-form__input"
                      inputmode={productInputMode}
                      ref={productInputRef}
                      onChange={(e) => handleselectedProductSku(e)}
                      value={selectedProduct.sku} />
              </label>
              <label>
                <p> {__('mode')} </p>
                <button 
                  type="button"
                  onClick={() => toggleInputMode()}
                  className="vz-button vzi-zone-archive__change-mode">
                  { productInputMode === 'numeric' ? 'a-Z' : '0-9'}
                </button>
              </label>
            </div>

            <div className="vzi-form__container">
              <label>
                <p> {__('Add')} </p>
                <button>
                  <VzIcon icon="add" />
                </button>
              </label>
              <label>
                <p> {__('Quantity')} </p>
                <input type="number"
                      name="quantity"
                      className="vzi-form__input" />
              </label>
              
              <label>
                <p> {__('Subtract')} </p>
                <button>
                  -
                </button>
              </label>
              <label>
                <p> {__('reset-label')} </p>
                <button>
                  {__('reset-button')}
                </button>
              </label>
              <label>
                <p> {__('motive')} </p>
                <select>
                  <option> {__('motive-sell')} </option>
                  <option> {__('motive-inventory')} </option>
                  <option> {__('motive-entry')} </option>
                </select>
              </label>
            </div>


            <div className="vzi-form__actions">
              {selectedProduct.id !== 'new' && (
                <button type="button"
                        className="vzi-button vzi-zone-archive__delete"
                        onClick={() => deleteProduct()}>
                  <VzIcon icon="delete" />
                  <span className="text-indented">
                    Delete
                  </span>
                </button>
              )}
              <button
                  className="vzi-button vzi-zone-archive__cancel"
                  type="button"
                  onClick={() => setSelectedProduct(null)}>
                Cancel
              </button>
              <button type="submit"
                      className="vzi-button vzi-zone-archive__save">
                Save
              </button>
            </div>
          </form>
        )}
      </section>
      <ul className="vzi-zone-archive__list">
        {
          zones.map(zone => (
            <li key={zone.id}
                className={ selectedZone && selectedZone.id === zone.id ? '--selected' : ''}>
              <article className="vzi-zone__card"
                       style={setColors(zone.color)}>
                <a className="vzi-zone-archive__zone"
                    href={getZoneLink(zone.id)}>
                  {
                    zone.post_title || 'New Zone'	
                  } 
                </a>
                <button className="vzi-button-edit-zone"
                        onClick={(e) => editZone(e, zone.id)}>
                  <VzIcon />
                  <span className="text-indented">
                    Edit
                  </span>
                </button>
              </article>
            </li>
          ))
        }
        { zones.length === 0 && (
            <li className="vzi-no-results">
              <article className="vzi-no-results__card">
                
                  No Zones
                
              </article>
            </li>
          )}
      </ul>
      <ul className="vzi-zone-archive__product-list">
        {(parentId > 0 && products.length === 0) && (
          <li className="vzi-no-results">
            <article className="vzi-no-results__card">
              No Products
            </article>
          </li>
        )}
        { products.map(product => (
            <li key={product.id}>
              <article className="vzi-product__card">
                <button className="vzi-product__card__details"
                      onClick={(e) => editProduct(product.id)}>
                  <p className="sku">
                    { product.sku || 'No SKU' }
                  </p>
                  <p className="name">
                    { product.title || 'New Product'	}
                  </p>
                </button>
                <div className="vzi-product__card__actions">
                  <a className="vzi-button-visit-product"
                          target="_blank"
                          href={productLink(product.id)}>
                    <VzIcon icon="visit" />
                    <span className="text-indented">Edit in WordPress</span>
                  </a>
                </div>
              </article>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default ZoneArchive;