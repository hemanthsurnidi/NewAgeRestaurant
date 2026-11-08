/**
 * AI & Intelligent Automation Engine for Nawabi Zaika / Nizami Biryani
 * 
 * Capabilities:
 * 1. Dynamic Kitchen Load & Prep-Time Estimation Engine
 * 2. Overdue Monitor & Proactive Late Alert Dispatch (>10 min delay handling)
 * 3. Personalized Customer Re-order Recommendation Engine (Strictly opt-in, never auto-adds to cart)
 * 4. DPDP 2023 Compliant WhatsApp/SMS Real-time Notification Dispatcher
 */

import { getActiveKitchenLoad, getOutletById, getCustomerOrderHistory, getFullMenuForOutlet } from './database.js';

/**
 * Calculates dynamic prep time for an order given the outlet and cart items
 * Enforces the strict rule: Promised Time = max(AI Estimate, Outlet Minimum Prep Time)
 */
export function calculateDynamicPrepTime(outletId, items, placedAt = new Date()) {
  const outlet = getOutletById(outletId);
  if (!outlet) {
    throw new Error(`Outlet not found: ${outletId}`);
  }

  // 1. Calculate Base Item Preparation Complexity
  let maxItemComplexity = 0;
  let totalSecondaryComplexity = 0;
  const itemBreakdown = [];

  for (const item of items) {
    const qty = item.quantity || 1;
    // Default complexity if not provided
    const baseComplexity = item.prep_complexity_minutes || 10;
    const itemTotal = baseComplexity * (1 + (qty - 1) * 0.4); // Each extra handi/portion adds incremental time

    itemBreakdown.push({
      name: item.name,
      quantity: qty,
      unit_complexity_min: baseComplexity,
      total_complexity_min: Math.round(itemTotal * 10) / 10
    });

    if (itemTotal > maxItemComplexity) {
      totalSecondaryComplexity += maxItemComplexity;
      maxItemComplexity = itemTotal;
    } else {
      totalSecondaryComplexity += itemTotal;
    }
  }

  // Kitchen parallelism factor: line cooks prepare sides & curries concurrently
  const effectiveFoodPrepTime = maxItemComplexity + (totalSecondaryComplexity * 0.28);

  // 2. Kitchen Concurrency & Queue Load
  const activeLoad = getActiveKitchenLoad(outletId);
  const activeOrdersCount = activeLoad ? activeLoad.active_count : 0;

  // 3. Peak Hour Detection (Hyderabad dinner peak 19:30 - 22:30, Friday & Sunday)
  const orderDate = new Date(placedAt);
  const hour = orderDate.getHours();
  const day = orderDate.getDay(); // 0 is Sunday, 5 is Friday
  const isWeekendPeakDay = (day === 0 || day === 5);
  const isDinnerPeakHour = (hour >= 19 && hour <= 22);

  let peakMultiplier = 1.0;
  let peakReason = 'Normal operating hours';

  if (isDinnerPeakHour && isWeekendPeakDay) {
    peakMultiplier = 1.40; // High peak up to 1,200 orders/hr network-wide
    peakReason = 'Weekend dinner peak rush (1,200 orders/hr network concurrency)';
  } else if (isDinnerPeakHour) {
    peakMultiplier = 1.25;
    peakReason = 'Weekday dinner rush';
  } else if (hour >= 12 && hour <= 15) {
    peakMultiplier = 1.15;
    peakReason = 'Lunch peak rush';
  }

  // Active load adds pipeline queuing time
  const queueWaitMinutes = activeOrdersCount * 2.2 * peakMultiplier;

  // Raw AI Estimate
  const rawAiEstimate = Math.ceil(effectiveFoodPrepTime + queueWaitMinutes);

  // Hard Business Constraint from Brief:
  // "The promised time is the higher of the AI estimate and the outlet's minimum"
  const outletMinFloor = outlet.min_prep_time_minutes || 20;
  const honestPromisedMinutes = Math.max(rawAiEstimate, outletMinFloor);

  // Calculate promised arrival timestamp
  const promisedDate = new Date(orderDate.getTime() + honestPromisedMinutes * 60000);

  return {
    outlet_id: outletId,
    outlet_name: outlet.name,
    raw_ai_estimate_minutes: rawAiEstimate,
    outlet_min_floor_minutes: outletMinFloor,
    promised_minutes: honestPromisedMinutes,
    promised_timestamp: promisedDate.toISOString(),
    active_kitchen_load: activeOrdersCount,
    peak_multiplier: peakMultiplier,
    peak_reason: peakReason,
    item_breakdown: itemBreakdown,
    confidence_score: activeOrdersCount > 8 ? 0.88 : 0.96,
    is_constrained_by_outlet_min: rawAiEstimate < outletMinFloor,
    rationale: rawAiEstimate < outletMinFloor
      ? `AI estimated ${rawAiEstimate} mins, but bumped to ${outletMinFloor} mins floor to honor outlet quality assurance.`
      : `Calculated from ${items.length} items (${Math.round(effectiveFoodPrepTime)}m) + ${activeOrdersCount} active kitchen pots (${Math.round(queueWaitMinutes)}m queue buffer under ${peakReason}).`
  };
}

/**
 * Checks an order for lateness and returns appropriate alerts
 * Rule from Brief:
 * "an order 10 minutes past its promise alerts the outlet manager and updates the customer"
 */
export function evaluateOrderLateness(order, currentTime = new Date()) {
  const promised = new Date(order.promised_at);
  const current = new Date(currentTime);
  const diffMs = current.getTime() - promised.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  const isLate = diffMinutes > 0;
  const isSeverelyLate = diffMinutes >= 10;

  let alertLevel = 'ON_TIME'; // 'ON_TIME' | 'DUE_SOON' | 'LATE' | 'CRITICAL_10M_LATE'

  if (isSeverelyLate) {
    alertLevel = 'CRITICAL_10M_LATE';
  } else if (isLate) {
    alertLevel = 'LATE';
  } else if (diffMinutes >= -8) {
    alertLevel = 'DUE_SOON';
  }

  return {
    order_id: order.id,
    outlet_id: order.outlet_id,
    diff_minutes: diffMinutes,
    is_late: isLate,
    is_severely_late: isSeverelyLate,
    alert_level: alertLevel,
    customer_alert_required: isSeverelyLate,
    manager_alert_required: isSeverelyLate,
    apology_credit_eligible: isSeverelyLate,
    status_label: isSeverelyLate
      ? `Late by ${diffMinutes} mins (CRITICAL ALERT - Manager Notified & Customer Compensation Triggered)`
      : isLate
        ? `Late by ${diffMinutes} mins`
        : diffMinutes >= -8
          ? `Due in ${Math.abs(diffMinutes)} mins`
          : `On Schedule (${Math.abs(diffMinutes)} mins remaining)`
  };
}

/**
 * Generates personalized re-order recommendations for a customer
 * Rule from Brief:
 * "AI suggests reorders from each customer's history... When it is wrong: suggestions never add items to the cart"
 */
export function getCustomerReorderRecommendations(phone, outletId) {
  const fullMenu = getFullMenuForOutlet(outletId);
  const pastOrders = getCustomerOrderHistory(phone);

  const itemFrequency = {};
  let totalPastOrders = pastOrders.length;
  let isVegetarianOnly = totalPastOrders > 0;

  for (const o of pastOrders) {
    for (const it of o.items) {
      itemFrequency[it.item_id] = (itemFrequency[it.item_id] || 0) + it.quantity;
      const menuItem = fullMenu.find(m => m.id === it.item_id);
      if (menuItem && !menuItem.is_veg) {
        isVegetarianOnly = false;
      }
    }
  }

  const recommendations = [];

  // Sort past items by frequency
  const frequentItemIds = Object.keys(itemFrequency).sort((a, b) => itemFrequency[b] - itemFrequency[a]);

  for (const itemId of frequentItemIds) {
    const item = fullMenu.find(m => m.id === itemId && m.is_available);
    if (item) {
      recommendations.push({
        ...item,
        badge: 'Frequently Re-ordered',
        confidence: 0.94,
        rationale: `You previously ordered this ${itemFrequency[itemId]} time${itemFrequency[itemId] > 1 ? 's' : ''}`
      });
    }
  }

  // If no past orders or less than 3, add top signature items from Hyderabad favorites
  if (recommendations.length < 3) {
    const fallbackFavorites = isVegetarianOnly
      ? ['item-veg-biryani', 'item-mirchi-ka-salan', 'item-double-ka-meetha']
      : ['item-chicken-dum-biryani', 'item-mutton-haleem', 'item-double-ka-meetha'];

    for (const fId of fallbackFavorites) {
      if (!recommendations.some(r => r.id === fId)) {
        const item = fullMenu.find(m => m.id === fId && m.is_available);
        if (item) {
          recommendations.push({
            ...item,
            badge: item.id === 'item-mutton-haleem' ? 'Hyderabad Signature' : 'Most Popular Direct Order',
            confidence: 0.88,
            rationale: item.id === 'item-mutton-haleem'
              ? 'Hand-pounded with desi ghee, Company A customer favorite'
              : 'Direct ordering favorite with 98% 5-star ratings'
          });
        }
      }
    }
  }

  return {
    customer_phone: phone,
    past_order_count: totalPastOrders,
    is_dietary_vegetarian: isVegetarianOnly && totalPastOrders > 0,
    // Strictly advisory recommendations - NEVER auto-added to cart!
    never_auto_add_guarantee: true,
    recommendations: recommendations.slice(0, 3)
  };
}

/**
 * Generates DPDP Act 2023 compliant WhatsApp/SMS message notifications
 */
export function generateNotificationPreview(order, eventType, extraPayload = {}) {
  const outlet = getOutletById(order.outlet_id);
  const outletName = outlet ? outlet.name : 'Nawabi Zaika';
  const customerName = order.customer_name || 'Valued Guest';

  let messageText = '';
  let channel = 'WhatsApp';

  switch (eventType) {
    case 'ORDER_PLACED':
      messageText = `✨ *Nawabi Zaika (${outletName})*\n\nAdab ${customerName}! Your order *#${order.id}* has been accepted directly by our kitchen.\n\n📦 *Items:* ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}\n💰 *Total:* ₹${order.total_amount} (Incl. 5% GST)\n⏱️ *Honest Promised Time:* ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n\n📍 *FSSAI Lic:* ${outlet ? outlet.fssai_license : '13622014000491'}\nLive tracking: https://nawabi-zaika.isocode.in/track/${order.id}`;
      break;

    case 'PREPARING':
      messageText = `🔥 *Nawabi Zaika Kitchen Update*\n\nChef Mohammed has unsealed the copper degh for order *#${order.id}*. Your biryani is cooking on gentle dum.\n\nEstimated ready by ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`;
      break;

    case 'READY_FOR_PICKUP':
      messageText = `✅ *Hot & Ready for Handover!*\n\nOrder *#${order.id}* is freshly packed in tamper-evident thermal boxes at ${outletName}.\nYour delivery rider is collecting it now!`;
      break;

    case 'DISPATCHED':
      messageText = `🛵 *Out for Delivery!*\n\nYour order *#${order.id}* has left ${outletName}. Keep your taste buds ready for authentic Hyderabadi flavors!`;
      break;

    case 'LATE_COMPENSATION_ALERT':
      messageText = `⚠️ *Honest Delay Apology from Nizami Zaika*\n\nAdab ${customerName}. Due to peak kitchen load at ${outletName}, order *#${order.id}* is running ~${extraPayload.diff_minutes || 10} minutes behind our promise.\n\nWe value your trust: *₹50 Nizami Loyalty Credit* has been credited to your phone number for your next direct feast. Thank you for your patience!`;
      break;

    default:
      messageText = `Nawabi Zaika: Status update for order #${order.id}: ${order.status}`;
  }

  return {
    order_id: order.id,
    customer_phone: order.customer_phone,
    channel: channel,
    dpdp_consent: Boolean(order.dpdp_marketing_consent),
    sent_at: new Date().toISOString(),
    message_text: messageText
  };
}
