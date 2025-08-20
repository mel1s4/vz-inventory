import React, { useState, useEffect, useRef } from 'react';
import { t } from '../utils/i18n';
import './zoneArchive.scss';
// import api from '../api';	
import axios from 'axios';
import Icon from '../components/Icon/Icon';

function ZoneArchive () {
  // Only use dev environment if actually running on localhost AND no WordPress params available
  const devEnv = window.location.hostname === 'localhost' && !window.vz_app_params;
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
  const [productInputMode, setProductInputMode] = useState('numeric');

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
        <Icon icon={icon} />
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
      color: '#ffffff',
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
    // Focus the input element when selectedZone changes
    if (selectedZone && zoneInputRef.current) {
      zoneInputRef.current.focus();
    }

    if (selectedProduct && productInputRef.current) {
      productInputRef.current.focus();
    }

  }, [selectedZone, selectedProduct]);


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
    if (!window.confirm(t('Are you sure you want to delete this zone?'))) {
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
    if (!window.confirm(t('Are you sure you want to delete this product?'))) {
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



  return (
    <section className='vzi-zone-archive'>
      { loading && (
          <div className="vzi-loader">
            <p>
              {t('Loading...')}
            </p>
          </div>
      )}
      <ul className="vzi-breadcrumb-list">
        <li>
        <a href={getZoneLink('home')}>{t('Home')}</a>
        </li>
        {
          breadcrum.map((item, index) => (
            <li key={index}>
              <a href={getZoneLink(item.id)}>{item.title}</a>
            </li>
          ))
        }
      </ul>
      <h2>{ parentZoneTitle || t('Home') }</h2>
      <section className="vzi-zone-archive__form-wrapper">
        <div className="vzi-archive__actions">
          <button className="vzi-button --add-zone"
                  onClick={addZone}>
            <VzIcon icon="add" />
              {t('Zone')}
          </button>
          { (parentId > 0) && (
            <button className="vzi-button --add-product"
                    onClick={addProduct}>
              <VzIcon icon="add_white" />
              {t('Product')}
            </button>
          )}
        </div>
        { selectedZone && (
          <form onSubmit={(e) => handleZoneUpdate(e)} 
                className="vzi-zone-archive__form">
            <p className="vzi-form__title">
              { selectedZone.id === 'new' ? t('Add') : t('Edit') } {t('Zone')}
            </p>
            <div className="vzi-form__container">                
              

              <label className="vzi-form__input-label">
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
                        className="vzi-button --delete"
                        onClick={() => deleteZone(selectedZone.id)}>
                  <VzIcon icon="delete" />
                  <span className="text-indented">
                    {t('Delete')}
                  </span>
                </button>
              )}
              <button
                  className="vzi-button --cancel"
                  type="button"
                  onClick={() => setSelectedZone(null)}>
                {t('Cancel')}
              </button>
              
              <button type="submit"
                      className="vzi-button --save">
                {t('Save')}
              </button>
            </div>
          </form>
        )}
        {selectedProduct && (
          <form onSubmit={(e) => handleProductUpdate(e)} 
                className="vzi-zone-archive__form">
            <p className="vzi-form__title">
              { selectedProduct.id === 'new' ? t('Add') : t('Edit') } {t('Product SKU')}
            </p>
            <div className="vzi-form__container">
              { selectedProduct.id !== 'new' && (
                <button type="button"
                        className="vzi-button --delete"
                        onClick={() => deleteProduct()}>
                  <VzIcon icon="delete" />
                  <span className="text-indented">
                    {t('Delete')}
                  </span>
                </button>
                )}
              <button
                  className="vzi-button --cancel"
                  type="button"
                  onClick={() => setSelectedProduct(null)}>
                {t('Cancel')}
              </button>
              <label>
                <input type="text"
                      name="sku"
                      inputmode={productInputMode}
                      ref={productInputRef}
                      onChange={(e) => handleselectedProductSku(e)}
                      value={selectedProduct.sku} />
              </label>
              <button 
                type="button"
                onClick={() => toggleInputMode()}
                className="vzi-button --change-mode">
                { productInputMode === 'numeric' ? 'a-Z' : '0-9'}
              </button>
              <button type="submit"
                      className="vzi-button --save">
                {t('Save')}
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
              <article className="vzi-zone__card">
                <a className="vzi-zone-archive__zone"
                    href={getZoneLink(zone.id)}>
                  <div 
                    className={`vzi-zone__color-indicator ${zone.color && zone.color !== '#ffffff' ? '--has-color' : ''}`}
                    style={{ backgroundColor: zone.color || '#ffffff' }}
                  ></div>
                  <span className="vzi-zone__name">
                    {zone.post_title || t('New Zone')}
                  </span>
                </a>
                <button className="vzi-button-edit-zone"
                        onClick={(e) => editZone(e, zone.id)}>
                  <VzIcon />
                  <span className="text-indented">
                    {t('Edit')}
                  </span>
                </button>
              </article>
            </li>
          ))
        }
        { zones.length === 0 && (
            <li className="vzi-no-results">
              <article className="vzi-no-results__card">
                
                  {t('No Zones')}
                
              </article>
            </li>
          )}
      </ul>
      <ul className="vzi-zone-archive__product-list">
        {(parentId > 0 && products.length === 0) && (
          <li className="vzi-no-results">
            <article className="vzi-no-results__card">
              {t('No Products')}
            </article>
          </li>
        )}
        {
          products.map(product => (
            <li key={product.id}>
              <article className="vzi-product__card">
                <button className="vzi-product__card__details"
                      onClick={(e) => editProduct(product.id)}>
                  <p className="sku">
                    { product.sku || t('No SKU') }
                  </p>
                  <p className="name">
                    { product.title || t('New Product')	}
                  </p>
                </button>
                <div className="vzi-product__card__actions">
                  <a className="vzi-button-visit-product"
                          target="_blank"
                          rel="noreferrer"
                          href={productLink(product.id)}>
                    <VzIcon icon="visit" />
                    <span className="text-indented">{t('Edit in WordPress')}</span>
                  </a>
                </div>
              </article>
            </li>
          ))
        }
      </ul>
    </section>
  );
}

export default ZoneArchive;