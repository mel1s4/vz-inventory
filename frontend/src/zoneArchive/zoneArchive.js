import React, { useState, useEffect, useRef, use } from 'react';
import './zoneArchive.scss';
// import api from '../api';	
import axios from 'axios';

function ZoneArchive () {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZoneVariable] = useState(null);
  const productInputRef = useRef(null);
  const zoneInputRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProductVariable] = useState(null);
  const [parentId, setParentId] = useState(0);
  const [breadcrum, setBreadcrum] = useState([]);
  const [parentZoneTitle, setParentZoneTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [restNonce, setRestNonce] = useState('');
  const [restUrl, setRestUrl] = useState('http://192.168.0.188/wp-json/');
  const [srcUrl, setSrcUrl] = useState('');
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
    headers: async () => {
      return {
        'Content-Type': 'application/json',
        // 'X-WP-Nonce': restNonce
      }
    },
    get: async (url, params) => {
      const headers = await api.headers();
      return axios.get(`${restUrl}vz-inventory/v1/${url}`, {
        headers,
        params
      });
    },
    post: async (url, data) => {
      const headers = await api.headers();
      return axios.post(`${restUrl}vz-inventory/v1/${url}`, data, {
        headers,
      });
    },
    put: async (url, data) => {
      const headers = await api.headers();
      return axios.put(`${restUrl}vz-inventory/v1/${url}`, data, {
        headers,
      });
    },
    delete: async (url, params) => {
      const headers = await api.headers();
      return axios.delete(`${restUrl}vz-inventory/v1/${url}`, {
        headers,
        params
      });
    }
  };

  function VzIcon({icon='edit'}) {
    const url = window.location.origin;
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
      ID: 'new',
      post_title: '',
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
    const nSelected = zones.find(zone => zone.ID === zoneId);
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
    // get the parent id from the URL
    setViewportHeight(window.visualViewport.height);
    window.visualViewport.addEventListener(['resize', 'scroll'], () => {
      setViewportHeight(window.visualViewport.height);
    });
    if(window.vz_app_params) {
      console.log({
        MELISA: window.vz_app_params
      });
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
    const uP = new URLSearchParams(window.location.search);
    const zid = uP.get('parent_id');
    fetchZones(parseInt(zid));
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
      };
      console.log(params);
        
      const response = await api.put(`zones/${selectedZone.ID}`, params );

      if (response.data.error) {
        console.error(response.data.error);
        setLoading(false);
        return;
      }

      if (response.data.id) {
        let updatedZones;
        if (selectedZone.ID === 'new') {
          updatedZones = [...zones, {
            ID: response.data.id,
            post_title: selectedZone.post_title,
          }];
          setZones(updatedZones);
        } else {
          updatedZones = zones.map(zone => {
            if (zone.ID === selectedZone.ID) {
              return {
                ...zone,
                post_title: selectedZone.post_title,
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
    setLoading(true);
    try {
      const response = await api.delete(`zones/${zoneId}`);
      console.log(response);
      const updatedZones = zones.filter(zone => zone.ID !== zoneId);
      setZones(updatedZones);
      setSelectedZone(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  async function deleteProduct() {
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
      <section className="vzi-zone-archive__form__wrapper"
                style={{ top: viewportHeight }}>
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
              { selectedZone.ID === 'new' ? 'Add' : 'Edit' } Zone
            </p>
            <div className="vzi-form__container">                
              {selectedZone.ID !== 'new' && (
                <button type="button"
                        className="vzi-button vzi-zone-archive__delete"
                        onClick={() => deleteZone(selectedZone.ID)}>
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
              <label>
                <input type="text" 
                      name="name"
                      ref={zoneInputRef}
                      onChange={(e) => handleSelectedZoneName(e)}
                      value={selectedZone.post_title} />
              </label>
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
              { selectedProduct.id === 'new' ? 'Add' : 'Edit' } Product SKU
            </p>
            <div className="vzi-form__container">
              { selectedProduct.id !== 'new' && (
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
                className="vz-button vzi-zone-archive__change-mode">
                { productInputMode === 'numeric' ? 'a-Z' : '0-9'}
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
            <li key={zone.ID}
                className={ selectedZone && selectedZone.ID === zone.ID ? '--selected' : ''}>
              <article className="vzi-zone__card">
                <a className="vzi-zone-archive__zone"
                    href={getZoneLink(zone.ID)}>
                  {
                    zone.post_title || 'New Zone'	
                  } 
                </a>
                <button className="vzi-button-edit-zone"
                        onClick={(e) => editZone(e, zone.ID)}>
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
        {
          products.map(product => (
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
          ))
        }
      </ul>
    </section>
  );
}

export default ZoneArchive;