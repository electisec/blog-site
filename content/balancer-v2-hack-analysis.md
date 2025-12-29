---
title: Breaking Down the Balancer V2 Hack
subtitle: Balancer v2 Composable Stable Pools (CSPv5) suffered an exploit due to a smart contract vulnerability that led to a total loss of approximately $121.1 million in assets.
gh-repo: yaudit/blog-site
tags: [balancer, blockchain-hacks, smart-contract-vulnerabilities]
author: boredpukar
twitter: https://x.com/boredpukar
date: 2025-12-28
---

# TL;DR

On **November 03, 2025**, the **V5 Composable Stable Pools on Balancer V2** were exploited due to a smart contract vulnerability, resulting in a total loss of approximately $121.1 million in assets.

Balancer V3 is architecturally different and thus remained unaffected. The exploit [was isolated to Balancer V2’s Composable Stable Pools](https://x.com/Balancer/status/1985390307245244573) across multiple chains, including Ethereum, Optimism, Arbitrum, Polygon, and Base. At the time of this writing, the team has identified and mitigated the attack vector. Balancer has also shared a [detailed post-mortem report](https://x.com/Balancer/status/1990856260988670132) of the exploit. The root cause of the exploit was a precision loss in the pool's math, which allowed attackers to manipulate the pool’s invariant and drain funds. In essence, a minor rounding discrepancy in the swap calculation led the attacker to trick the protocol into undervaluing its Balancer Pool Tokens (BPT), enabling them to buy those BPT cheaply and withdraw disproportionate amounts of underlying assets. Of the total stolen assets, [approximately $45.7 million worth in funds](https://medium.com/balancer-protocol/nov-3-exploit-post-mortem-51dcbeb6b020) were protected or recovered through whitehat recoveries and other emergency response actions.

**Attack Transactions by Chain:**

- **Ethereum Mainnet:**
    - [0x6ed07db1a9fe5c0794d44cd36081d6a6df103fab868cdd75d581e3bd23bc9742](https://etherscan.io/tx/0x6ed07db1a9fe5c0794d44cd36081d6a6df103fab868cdd75d581e3bd23bc9742)
    - [0x0861b2a70d67d0f8c81030e9ef1bc645e9799b2535df401a425465ea5efae457](https://etherscan.io/tx/0x0861b2a70d67d0f8c81030e9ef1bc645e9799b2535df401a425465ea5efae457)
    - [0xb8a978185e834620f5572aaa9b3858630abfcdbe09459c512f54b3a26ef643d4](https://etherscan.io/tx/0xb8a978185e834620f5572aaa9b3858630abfcdbe09459c512f54b3a26ef643d4)
    - [0x6256d6e9e6effe2692ba97f7f5047c0e3f6d8cc6407e84b80cf9e7c89636c422](https://etherscan.io/tx/0x6256d6e9e6effe2692ba97f7f5047c0e3f6d8cc6407e84b80cf9e7c89636c422)
    - [0x2a0ead4ee9b17a1afa5bfe3dc152833a957f2d25dd9b4b86d68f2c87bdacf69c](https://etherscan.io/tx/0x2a0ead4ee9b17a1afa5bfe3dc152833a957f2d25dd9b4b86d68f2c87bdacf69c)
- **Arbitrum:**
    - [0xe4dfc8b8b54eb7e101d59cd9f87f389186b2e8f6e188557ae9dfdbea2b12e703](https://arbiscan.io/tx/0xe4dfc8b8b54eb7e101d59cd9f87f389186b2e8f6e188557ae9dfdbea2b12e703)
    - [0xfe3d66d50b4f837994d0a06220e3b14f7652e79c12bc92362f6a760b630c6999](https://arbiscan.io/tx/0xfe3d66d50b4f837994d0a06220e3b14f7652e79c12bc92362f6a760b630c6999)
    - [0x962e95dfa66936d96c25e75cf7aba023e0486b3d63f477664899dbbf54d7aa86](https://arbiscan.io/tx/0x962e95dfa66936d96c25e75cf7aba023e0486b3d63f477664899dbbf54d7aa86)
    - [0x5258dcfdd5fa04a81648e1e6d8caffd7438cf27d6bcfc8d1cb0e8c005307eee1](https://arbiscan.io/tx/0x5258dcfdd5fa04a81648e1e6d8caffd7438cf27d6bcfc8d1cb0e8c005307eee1)
- **Optimism:**
    - [0xbc21983ea3422d31cd18625a907349f543f255a22abe2bc6eb5ffcb7ec7ced96](https://optimistic.etherscan.io/tx/0xbc21983ea3422d31cd18625a907349f543f255a22abe2bc6eb5ffcb7ec7ced96)
    - [0x48e5994a82d9a24a90f3039ae9870065f968d3760da8de2569295a6fb2152813](https://optimistic.etherscan.io/tx/0x48e5994a82d9a24a90f3039ae9870065f968d3760da8de2569295a6fb2152813)
- **Polygon:**
    - [0x167993d4cc39771923a6cd11d2d6e73a1b68c7464ea3c76ba41fbd32df7a96da](https://polygonscan.com/tx/0x167993d4cc39771923a6cd11d2d6e73a1b68c7464ea3c76ba41fbd32df7a96da)
- **Base:**
    - [0x29135f912d67db38478d0be70b9f2a1fab3b121b74d776f835ac66d6df134ec5](https://basescan.org/tx/0x29135f912d67db38478d0be70b9f2a1fab3b121b74d776f835ac66d6df134ec5)

## **The Key Components Involved**

(a) **Composable Stable Pools**

These are Balancer V2 pools designed for like-valued assets using a [StableSwap, similar to Curve’s model](https://rareskills.io/post/curve-get-d-get-y). What makes them composable is that the pool’s own LP token (the Balancer Pool Token, BPT) is itself one of the pool’s assets and can be swapped in and out like any underlying token. This allows nesting of pools and multi-layer swaps — for example, a WeightedPool can hold a BPT from a stable pool to aggregate liquidity.

The invariant (denoted `D`) represents the pool’s total virtual value, and the price of the BPT is effectively tied to this invariant (roughly the price of `BPT` ≈ `D` / `virtualSupply`). Here, `virtualSupply` refers to the circulating BPT tokens excluding the preminted BPT tokens held by the Vault. Notably, if `D` can be artificially reduced in size, even without an actual loss of tokens, the BPT price can appear underpriced — a fact the attacker leveraged.

According to [Balancer’s documentation](https://docs-v2.balancer.fi/concepts/pools/composable-stable.html) —

> Composable Stable Pools are designed for assets expected to swap at near-parity or at a consistently known exchange rate. Composable Stable Pools use [**Stable Math**](https://docs-v2.balancer.fi/reference/math/stable-math.html) (based on StableSwap, popularized by Curve), which allows for swaps of significant size before encountering substantial price impact, vastly increasing capital efficiency for like-kind and correlated-kind swaps.
> 

> A **pool is composable** when it allows swaps to and from its own LP token. Putting its LP token into other pools allows easy batch swaps from nested pool tokens to tokens in the outer pool. With `ComposableStablePool[DAI, USDC, USDT]`, we can directly pair the LP token, or BPT (Balancer Pool Token), against WETH in a `WeightedPool[WETH, CSP-BPT]`. This nesting consolidates liquidity into the most common groupings, resulting in deeper liquidity and better prices across Balancer. In this example, it also saves you the trouble of making 3 WeightedPools `[WETH, DAI]`, `[WETH, USDC]`, `[WETH, USDT]`.
> 

A detailed technical explanation of [Curve Stableswap’s `A` parameter](https://updraft.cyfrin.io/courses/curve-v1/contract-overview/code-walkthrough-a), [its relationship to liquidity `D`](https://updraft.cyfrin.io/courses/curve-v1/contract-overview/code-walkthrough-get-d), how it is calculated, and a comprehensive guide to [understanding the working of virtual price](https://updraft.cyfrin.io/courses/curve-v1/contract-overview/code-walkthrough-get-virtual-price) in StableSwap can be found in the [Curve Stableswap course at Cyfrin Updraft](https://updraft.cyfrin.io/courses/curve-v1).

(b) Balancer **Vault** 

All pools in Balancer V2 share a common Vault contract for token custody and accounting. The Vault architecture separates token storage from pool logic, enabling efficient `batchSwap` operations across multiple pools. In a `batchSwap`, token transfers don’t occur at each swap step; instead, the **Vault internally tracks net balance changes for each token and only settles the net deltas at the end of the transaction**.

Crucially, the Vault allows transient user balance deltas in internal accounting during a `batchSwap`. It means that a user can execute a sequence of events that mimics flash swaps, effectively borrowing assets internally within the transaction, as long as the final net deltas are settled by the end of the transaction. This design, which effectively allows users to perform multi-hop swaps without pre-funding every intermediate token, was exploited by the attacker. They were able to swap out assets (even BPT itself) without initially owning them, accumulate a user-side debit, and later settle that debit — all within a single atomic transaction.

> The [Vault architecture](https://docs-v2.balancer.fi/concepts/vault/) separates the token accounting and management from the pool logic. This separation simplifies pool contracts, since they no longer need to manage their assets actively; pools only need to calculate amounts for swaps, joins, and exits.
> 
> 
> This architecture brings different pool designs under a single umbrella; the Vault is agnostic to pool math and can accommodate any system that meets a few requirements. Anyone who comes up with a novel idea for a swapping system can create a custom pool plugged directly into Balancer’s existing liquidity, without needing to build their own decentralized exchange.
> 

(c) **Scaling and Rounding helpers**

Balancer pools handle tokens with different decimals or underlying rates by scaling amounts to a unified internal precision. Each token has a scaling factor so that, for internal mathematical calculations, values are scaled to use 18-decimal fixed-point math. Upscaling multiplies token amounts by this factor; downscaling divides them back down.

Mathematically, suppose we ignore integer rounding, upscaling and downscaling would be exact inverses. But in practice, Balancer’s implementation introduces a subtle rounding discrepancy: upscaling always rounds down (truncating any fractional part), whereas downscaling can round up or down depending on context. The design effectively treated this one-directional rounding during upscale as having minimal impact. However, when scaling factors are not simple powers of ten, multiplying a tiny amount can produce a fractional result that gets rounded down. This inconsistency — rounding down on upscale but rounding up on the corresponding downscale — set the stage for the exploit by introducing **tiny precision losses that favored the attacker**.

## **Root Cause: Rounding Error in `_swapGivenOut`**

In a [Stable Pool](https://resources.curve.finance/pdf/curve-stableswap.pdf), the invariant `D` should remain the same or increase slightly due to fees during swaps under normal conditions. In exact math terms, it should not materially decrease, and in implementation, it should not meaningfully drop beyond a negligible rounding noise. In this incident, `D` dropped, indicating a value leaked from the pool.

The root cause was traced to a bug in `BaseGeneralPool::_swapGivenOut`, used by stable pools when a swap is specified as **“GIVEN_OUT”**. In this context, the user defines how much output they want, and the pool calculates the needed input.

Now, let’s examine the code excerpts from the actual vulnerable contract. Pools make use of `onSwap()` to call the [BaseGeneralPool._swapGivenOut()](https://etherscan.io/address/0xdacf5fa19b1f720111609043ac67a9818262850c#code#F22#L68) function. The Vault calls this function when a user requests `IVault.swap` or `IVault.batchSwap` to swap with the Pool.

```solidity
function onSwap(
        SwapRequest memory swapRequest,
        uint256[] memory balances,
        uint256 indexIn,
        uint256 indexOut
    ) external override onlyVault(swapRequest.poolId) returns (uint256) {
        _beforeSwapJoinExit();

        _validateIndexes(indexIn, indexOut, _getTotalTokens());
        uint256[] memory scalingFactors = _scalingFactors();

        return
            swapRequest.kind == IVault.SwapKind.GIVEN_IN
                ? _swapGivenIn(swapRequest, balances, indexIn, indexOut, scalingFactors)
                : _swapGivenOut(swapRequest, balances, indexIn, indexOut, scalingFactors);
    }

function _swapGivenOut(
        SwapRequest memory swapRequest,
        uint256[] memory balances,
        uint256 indexIn,
        uint256 indexOut,
        uint256[] memory scalingFactors
    ) internal virtual returns (uint256) {
        _upscaleArray(balances, scalingFactors);
        swapRequest.amount = _upscale(swapRequest.amount, scalingFactors[indexOut]);

        uint256 amountIn = _onSwapGivenOut(swapRequest, balances, indexIn, indexOut);

        // amountIn tokens are entering the Pool, so we round up.
        amountIn = _downscaleUp(amountIn, scalingFactors[indexIn]);

        // Fees are added after scaling happens, to reduce the complexity of the rounding direction analysis.
        return _addSwapFeeAmount(amountIn);
    }
```

These are the key operations involved in this function:

(a) `_upscaleArray(balances, scalingFactors);` → scales all token balances to the 18-decimal internal precision.

(b) `swapRequest.amount = _upscale(swapRequest.amount, scalingFactors[indexOut]);`

→ As viewed from [`BasePool::_upscale()`](https://etherscan.io/address/0xdacf5fa19b1f720111609043ac67a9818262850c#code#F31#L680), the underlying operation uses `mulDown`, thus favoring the taker in `GIVEN_OUT`. This is where the issue arises in this path: `_upscale` uses `mulDown` on `swapRequest.amount`, so the upscaled output is slightly smaller than it should be. Rounding down the output token amount means the pool slightly underestimates how much value it’s giving out.

```solidity
/**
     * @dev Same as `_upscale`, but for an entire array. This function does not return anything, but instead *mutates*
     * the `amounts` array.
     */
    function _upscaleArray(uint256[] memory amounts, uint256[] memory scalingFactors) internal pure {
        uint256 length = amounts.length;
        InputHelpers.ensureInputLengthMatch(length, scalingFactors.length);

        for (uint256 i = 0; i < length; ++i) {
            amounts[i] = FixedPoint.mulDown(amounts[i], scalingFactors[i]);
        }
    }
    
/**
     * @dev Applies `scalingFactor` to `amount`, resulting in a larger or equal value depending on whether it needed
     * scaling or not.
     */
    function _upscale(uint256 amount, uint256 scalingFactor) internal pure returns (uint256) {
        // Upscale rounding wouldn't necessarily always go in the same direction: in a swap for example the balance of
        // token in should be rounded up, and that of token out rounded down. This is the only place where we round in
        // the same direction for all amounts, as the impact of this rounding is expected to be minimal (and there's no
        // rounding error unless `_scalingFactor()` is overriden).
        return FixedPoint.mulDown(amount, scalingFactor);
    }
    
	/**
     * @dev Returns the scaling factor for one of the Pool's tokens. Reverts if `token` is not a token registered by the
     * Pool.
     *
     * All scaling factors are fixed-point values with 18 decimals, to allow for this function to be overridden by
     * derived contracts that need to apply further scaling, making these factors potentially non-integer.
     *
     * The largest 'base' scaling factor (i.e. in tokens with less than 18 decimals) is 10**18, which in fixed-point is
     * 10**36. This value can be multiplied with a 112 bit Vault balance with no overflow by a factor of ~1e7, making
     * even relatively 'large' factors safe to use.
     *
     * The 1e7 figure is the result of 2**256 / (1e18 * 1e18 * 2**112).
   */
    function _scalingFactor(IERC20 token) internal view virtual returns (uint256);
```

(c) `uint256 amountIn = _onSwapGivenOut(swapRequest, balances, indexIn, indexOut);` → This function-call implements the StableSwap invariant solver. And due to the operations in step (b) above, the solver is working with a slightly smaller output amount than it should, so it finds a smaller `amountIn` than the true economic value.

(d) `amountIn = _downscaleUp(amountIn, scalingFactors[indexIn])` → `_downscaleUp` uses `divUp` to round up `amountIn`. Normally, rounding up here is meant to ensure the user pays a tiny bit extra, protecting the pool. But because the prior step under-calculated `amountIn` in the first place, even rounding up still results in the user paying less than they should.

(e) `return _addSwapFeeAmount(amountIn);` → Fees are added after scaling to reduce rounding-direction combinatorics.

The **crux of the attack** took place at Step (b), in which rounding should have favoured the pool. Rounding down the `amountOut`, which is the user-specified token-out request at upscale under-represents what the pool believes it must deliver at internal precision, so the solver computes a too-small `amountIn`. In simpler terms, the pool thought it was giving out slightly less than it actually does and asked for too little `amountIn` causing `D` to drop in pathological states. Later, after the completion of Step (d) operation, the user still pays less than the economically correct amount. It is therefore possible that the pool can exhibit a net loss, and `D` can drop.

This means that the swap operations were inherently problematic.
- Upscaling the output amount. The exact amount of token the user wants out (`swapRequest.amount`) is scaled to 18-decimal internal units via `_upscale`. This function calls `FixedPoint.mulDown(amount, scalingFactor)`, which rounds down any fractional remainder. In a `GIVEN_OUT` swap, rounding down at this step benefits the user: it makes the internal target output amount slightly smaller than it should be. Essentially, the pool underestimates how much it will pay out.

- Downscaling the input amount. After solving the invariant equation for the required input (at internal precision), the function downsizes the `amountIn` via `_downscaleUp` (which rounds up to ensure the user provides enough). Normally, rounding up here protects the pool. However, because the prior upscale already undercut the output, the calculated `amountIn` is inherently too low. Even after rounding up, the user ends up paying less than the actual economic value of the output tokens they receive.

For someone who doesn’t want to examine the mathematical dynamics beyond what has been explained above, the pool is made to believe the user is requesting slightly fewer tokens than they actually are, so it asks for a smaller amount of input in return. The result is a tiny shortfall – the pool gives out a bit more value than it takes in, causing the pool’s invariant `D` to drop by a small amount after that swap. Under most conditions, this discrepancy would be negligible (just a few wei of token), and the NatSpec comment even notes that the impact is expected to be minimal unless `_scalingFactor()` is overridden with a non-standard factor. Unfortunately, that is precisely the case in these pools (due to rate scaling), and in extremely low-balance conditions, these tiny losses become economically significant.

## The Criticality of the Bug

As per the invariant formula of StableSwap design, the liquidity factor `D` **should not decrease**. In essence, a decline would indicate that the pool lost value. The rounding error above created a scenario where `GIVEN_OUT` **swaps on affected pools could shave off a sliver of** `D`. If an attacker can force a pool into a state where even a minuscule swap causes a noticeable drop in `D`, they can then exploit that drop to their advantage.

In this exploit, the attacker found that swapping out an absurdly small amount — in fact, only **17 wei of a token** — at the right moment would cause the internal math to miscalculate enough that `D` decreased **instead of remaining constant**. This 17-wei swap was the tipping point that **broke the invariant’s usual guarantee**, allowing the attacker to steal value from the pool effectively.

**Why 17 wei?** It turns out this number was carefully chosen. In one of the exploited `osETH/WETH` pools, the non-integer scaling factors (derived from the `osETH` rate, roughly in the `1.05×` range) meant that scaling `17 wei` produces a fractional internal amount of about `17.988` units just below `18 wei`.

The math then truncates it with `mulDown`, bringing it back to `17`, effectively giving away nearly `one wei` of value. That fractional discrepancy – on the order of `1e-18 ETH` – was enough to noticeably drop `D` when the pool’s total reserves were already pushed to the brink. It’s an edge case **rounding cliff** where the invariant solver’s standard assumptions break down. Hitting that cliff caused the pool’s virtual price to plummet, making the BPT token massively undervalued relative to the remaining assets.

The attacker could now purchase BPT at this deflated price and then exchange it for the pool’s underlying tokens at the actual value, making a profit, after the invariant was purposefully lowered.

## Anatomy and Execution of the Real Attack

The exploit was executed in an atomic `batchSwap` transaction per targeted pool (per chain), consisting of numerous swap steps. The attacker’s overall plan was to force the pool into a situation where the rounding bug would have a significant impact, then take advantage of it.

The attack execution can be thought of in three different phases:

**Phase 1. Drain Liquidity to Minimal Levels —**

For one or more underlying tokens, the attacker first drove the pool’s balances to almost zero. To accomplish this, they swapped large amounts of `BPT` for underlying tokens (`GIVEN_OUT` swaps for underlying) to extract as many real tokens as possible. Each swap in this phase was calibrated to withdraw almost all of a token’s balance, but leaving just a tiny residue.

For example, they would swap `BPT` for `WETH`, then `BPT` for `wstETH` or `sETH`, alternating and gradually ratcheting down the reserves. Because `BPT` itself was a pool asset and the Vault’s `batchSwap` allows deferred settlement of token balances within a single transaction, the attacker could trade with a temporary negative BPT balance delta inside the batch, as long as everything netted out by the end.

By the end of Phase 1, the pool’s balances were extremely low, and the pool’s invariant `D` decreased proportionally to the withdrawn liquidity. However, the virtual price (ratio of `D` to `supply`) remained stable.

**Phase 2. Trigger the Rounding Exploit —** 

When the pool was in a volatile state with extremely low balances, the attacker exploited rounding errors to execute the precision-loss swap. Specifically, they performed a `GIVEN_OUT` swap for an almost negligibly small amount of one token – in observed transactions, this was often `17 wei` of a token (for instance, `17 wei` of `osETH` in an `osETH/WETH`-based pool). This tiny swap is where the rounding bug came into play. Because of the non-integer scaling factor and rounding down, the pool computed that it only needed a trivial amount of the other token in exchange, underestimating the actual cost.

Internally, the math solver discovered a solution that technically satisfied the equations at lower precision by enforcing the invariant iteratively. That solution made it possible for `D` to slightly drop, which shouldn’t have happened if all calculations were precise or appropriately rounded to the pool’s advantage.

In effect, the pool gave out `17 wei` of one token but didn’t charge enough of the other token, shrinking the total invariant. This one precision-loss swap broke the invariant’s safety net – after it and its repetitions, the pool’s virtual price (`D` / `virtualSupply`) plummeted substantially, often to a tiny fraction of its original value.

In a large, well-liquid pool, a drop in `D` of this magnitude would be negligible as a fraction of total value. Still, here, since the pool was nearly drained already, it represented a significant percentage of the pool’s remaining value.

**Phase 3. Buy Cheap BPT and Withdraw Profit —**

Now the trap is sprung. The pool’s BPT token is massively undervalued (because `D` fell, but the same `BPT` supply exists). The attacker, still within the same `batchSwap`, immediately swapped the underlying tokens back into BPT at this deflated rate. In other words, they could buy up a massive amount of BPT for far less than it would typically cost. This swap restored the pool’s balances, which in turn would restore `D` to a more normal level – but crucially, the attacker now held most of the `BPT` supply.

Finally, the attacker exited the pool by redeeming those BPT for the underlying assets. The attacker could remove the actual tokens (`WETH`, `wstETH`, `osETH`, etc.) from the pool’s reserves because BPT represents claims on the pool. Because they had acquired BPT so cheaply, this redemption gave them **much more value in tokens than the cost to obtain the BPT**. At the end of the `batchSwap`, the Vault’s net settlement showed the attacker owing nothing and instead drained a large amount of the pool’s tokens to their balance.

The transaction completed with the attacker’s contract holding the loot, which they later transferred out. Essentially, the attacker performed a self-contained flash-loan-assisted **attack swap cycle**: drain liquidity → exploit rounding to tank BPT price → buy BPT cheap → withdraw tangible assets. All other participants in the pool were left holding near-worthless BPT, and the real token reserves were siphoned away.

## Carriers of the Attack

Several design features of Balancer V2’s pools and Vault made this exploit possible:

**(i) Composable Pools (BPT as a Pool Token).** Because the pool’s own BPT was an asset within the pool, the attacker could swap BPT for tokens and vice versa, just like any other swap. This enabled them to drastically alter the pool’s balances and even empty out tokens by trading against the pool with BPT.

**(ii) Vault Batch Swaps with Deficit Spending.** The Vault’s design allowed the attacker to execute swaps involving tokens they didn’t actually have by accumulating deficits. In particular, the attacker didn’t need to own BPT upfront – they could perform **BPT-to-token** swaps that left them owing BPT to the pool, then later acquire that BPT cheaply and square up.
This is analogous to a flash loan – it allowed the attacker to borrow the pool’s tokens and even its BPT within the same atomic transaction. The flexibility of batch-swap was turned against the protocol itself.

**(iii) Amplification and Rate Scaling.** The stable pool’s high amplification coefficient (`A`) makes the invariant very flat around the balanced region. Hence, the pool tries to maintain a near-1:1 pricing even when swaps would usually move the price. When absolute balances become very small, the combination of high `A` and tiny integer steps in the balances makes the invariant calculation numerically fragile. In such cases, minor rounding differences translate into significant relative changes in `D`.

Meanwhile, rate scaling factors (for tokens like `wstETH`, `osETH`, etc.) introduced non-integer scaling, which the rounding bug mishandled. The attacker specifically targeted pools with such tokens, knowing the precision issues would be magnified there. The choice of a `17 wei` output appears to have been carefully selected to minimize rounding error under those scaling factors. In short, the pool was pushed into a zone where the math precision, combined with asymmetric rounding, broke down.

## The Solution: Rounding in Favor of the Pool

The basic solution for this particular vulnerability is to ensure that upscaling doesn’t work in the user’s favor. In practice, this means changing the `_upscale` operation in the `GIVEN_OUT` swap path to round up rather than down. Doing so, the pool will slightly overestimate the number of tokens it needs to output in internal calculations, thereby requiring a bit more input, keeping the invariant intact, or even causing `D` to increase by a tiny amount.

In code, a minimal conceptual fix is to replace `FixedPoint.mulDown` with `FixedPoint.mulUp` for that operation and add a corresponding `_upscaleUp` function (to mirror `_downscaleUp`). The code difference below illustrates the probable change fix:

```diff
function _swapGivenOut(
        SwapRequest memory swapRequest,
        uint256[] memory balances,
        uint256 indexIn,
        uint256 indexOut,
        uint256[] memory scalingFactors
    ) internal virtual returns (uint256) {
        _upscaleArray(balances, scalingFactors);
-       swapRequest.amount = _upscale(swapRequest.amount, scalingFactors[indexOut]);
+       swapRequest.amount = _upscaleUp(swapRequest.amount, scalingFactors[indexOut]);

        uint256 amountIn = _onSwapGivenOut(swapRequest, balances, indexIn, indexOut);

        // amountIn tokens are entering the Pool, so we round up.
        amountIn = _downscaleUp(amountIn, scalingFactors[indexIn]);

        // Fees are added after scaling happens, to reduce the complexity of the rounding direction analysis.
        return _addSwapFeeAmount(amountIn);
    }
    
	/**
     * @dev Applies `scalingFactor` to `amount`, resulting in a larger or equal value depending on whether it needed
     * scaling or not.
     */
    function _upscale(uint256 amount, uint256 scalingFactor) internal pure returns (uint256) {
        // Upscale rounding wouldn't necessarily always go in the same direction: in a swap for example the balance of
        // token in should be rounded up, and that of token out rounded down. This is the only place where we round in
        // the same direction for all amounts, as the impact of this rounding is expected to be minimal (and there's no
        // rounding error unless `_scalingFactor()` is overriden).
        return FixedPoint.mulDown(amount, scalingFactor);
    }
    
+   function _upscaleUp(uint256 amount, uint256 scalingFactor) internal pure returns (uint256) {
+       return FixedPoint.mulUp(amount, scalingFactor);
+   }
```

This fix will cause the internal calculation to treat a user-requested output amount as higher than it actually is. This helps ensure that the `amountIn` that the solver finds at least covers the actual cost. In other words, any rounding now favors the pool’s safety. After this change, the pathological swap sequence used in the exploit would no longer cause a drop in `D`, the invariant would hold, and the attacker’s trick would fail.

It’s worth noting that Balancer V3 was already immune to this specific issue. V3 uses a simplified architecture in which all tokens operate at 18 decimal precision natively in the Vault, and pool math was redesigned with explicit rounding rules that always favor the protocol. Composable pools in V3 were replaced with a different mechanism that avoids having the pool hold its own BPT, eliminating this class of attack vector.

## Proof of Concept (PoC) Walkthrough

We have developed a coded PoC for demonstrating the attack: [https://github.com/yAudit/blockchain_hacks/blob/main/test/BalancerV2.t.sol](https://github.com/yAudit/blockchain_hacks/blob/main/test/BalancerV2.t.sol)

To better understand how the vulnerability manifests in practice, let us walk through the PoC that demonstrates the exploit mechanics on a forked mainnet state. The PoC is structured as a series of progressive tests, each illuminating a different facet of the attack.

### Running the PoC
The PoC uses Foundry's fork testing capabilities to interact with real Balancer V2 contracts at a block height before the exploit (block `21103650`). To execute the tests, clone the repo and follow the instructions to run the associated test suite. 

```bash
# Run the Balancer V2 exploit
forge test --match-path test/BalancerV2.t.sol
```

### Test 1: Demonstrating the Rounding Bug
The first test retrieves the actual scaling factors from the `osETH/WETH` pool and demonstrates why the rounding error exists:

```solidity
// Get pool info
bytes32 poolId = OSETH_BPT.getPoolId();
(IERC20[] memory tokens, uint256[] memory balances,) = VAULT.getPoolTokens(poolId);
uint256[] memory scalingFactors = OSETH_BPT.getScalingFactors();

// osETH has a scaling factor > 1e18 due to its yield-bearing nature
// At the time of the exploit: ~1058132408689971699 (approximately 1.058e18)
uint256 osethScalingFactor = scalingFactors[osethIndex];
```

The critical insight emerges when we calculate the optimal attack amount. We seek a value `n` where `n × scalingFactor` produces maximum truncation when divided by `1e18`:

```solidity
uint256 rateDelta = osethScalingFactor - 1e18;  // ~0.058e18
uint256 optimalAmount = 1e18 / rateDelta;        // ≈17
```

With `n = 17`:

- Ideal internal value (untruncated): `(17 × 1.058e18) / 1e18 = 17.986`
- `mulDown` result (vulnerable path): `17`
- If we rounded UP instead `mulUp` (the correct internal value): `18`
- **Discarded remainder**: `0.986` internal units

This demonstrates the core vulnerability. The pool’s internal math prices the user’s request for `17 raw-token wei` as `17 internal units` via `mulDown`, even though the normalized value is closer to `~17.986 internal units`, so the solver undercharges the required input. 

The difference is nearly one complete **internal unit** of normalized value `≈0.986`, which becomes extractable when the pool is forced into a fragile, low-balance state and the pattern is repeated.

### Test 2: Attack Economics
The second test analyzes whether the rounding error exceeds the swap fee cost:

```solidity
uint256 swapFeePercentage = OSETH_BPT.getSwapFeePercentage();  // 0.04%
uint256 swapFeeCost = optimalAmount * swapFeePercentage / 1e18;
// For 17 wei, integer math truncates this to 0 (fee is negligible)

if (roundingError > swapFeeCost) {
    // Rounding error (~0.986e18) >> swap fee cost
    // ATTACK IS PROFITABLE!
}
```

Even after fee rounding, the truncation effect can still dominate, which is why repeating the pattern can push the pool invariant in the attacker’s favor.

### Test 3: Phase 1 — Drain Liquidity
The third test illustrates why the attacker must first drain the pool's liquidity. This is the most subtle aspect of the exploit.

The rounding error exists at any balance level, but its impact on the invariant `D` is negligible when pool balances are large. Consider a simplified StableSwap invariant approximation for illustration:

$$
D \approx 2\sqrt{x_1 \cdot x_2}
$$

(The actual three-token Composable Stable Pool uses a more complex formula, but the principle holds.)

When balances are in the thousands of ETH, a 1-wei error changes `D` by an imperceptible fraction. But when balances are reduced to approximately 87,000 wei, that same 1-wei error represents a significant relative change in `D`.

```solidity
// Target: reduce balances to ~87000 wei
uint256 targetRemainBalance = 87000;
```

The drain is accomplished by swapping BPT for underlying tokens. Because BPT is itself a pool asset in Composable Stable Pools, the attacker can use the Vault's `batchSwap()` to extract real tokens while accumulating a BPT deficit. Crucially, this deficit is a *transient* internal accounting entry within the batch — the Vault allows intermediate negative balances as long as they are fully settled before `batchSwap()` returns. The attacker effectively borrows BPT that will be repaid later at a crashed price.

**Why 87,000 specifically?** This value was determined empirically. The StableSwap invariant calculation uses Newton-Raphson iteration, which does not converge for all balance combinations. The attacker had to discover through simulation which target balance allows all subsequent exploit swaps to execute without reverting.

### Test 4: Phase 2 — Exploit Swaps

With the pool drained to minimal balances, the attacker executes a repeating pattern of three swaps (a "triplet"):

```solidity
// Triplet Pattern:
// 1. PRIME: Position the osETH balance at exactly 18
// 2. EXPLOIT: Swap out 17 osETH → extract rounding error
// 3. RESET: Restore balance to 18 for next iteration
```

Each triplet causes the pool to repeatedly lose almost one internal normalized unit worth of value in its invariant math, which means the discarded fractional remainder from `mulDown` is close to `1.0`. 

This loss is `< 1 unit` per exploit-swap. Still, when balances are forced into tiny, fragile states, and the pattern is repeated many times, the cumulative effect can materially reduce `D`, which in turn crashes the BPT price:

$$
\text{BPT Price} = \frac{D}{\text{Virtual Supply}}
$$

The attacker packs 40 triplets into each `batchSwap` call, executing thousands of batches to destroy `D` systematically.

### Test 5: Full Attack Simulation
The final simulation estimates the cumulative discarded remainder in 18-decimal fixed-point. Note that `targetBalance` here refers to the 17-wei swap amount used in the exploit phase (not to be confused with the 87000-wei balance after draining):

```solidity
uint256 targetBalance = 17;  // Optimal swap amount for max rounding error
uint256 tripletsPerBatch = 40;
uint256 estimatedBatches = 10000;

uint256 errorPerSwap = (targetBalance * osethScalingFactor) % 1e18;
uint256 totalError = errorPerSwap * tripletsPerBatch * estimatedBatches;
```

The test also calculates the BPT price impact. As `D` collapses, the BPT becomes massively undervalued. The attacker then buys this cheap BPT with a fraction of the extracted value, using it to settle their transient deficit from Phase 1. The profit is realized as the difference between the value of tokens drained in Phase 1 and the cost to acquire enough BPT to settle the deficit, since BPT is now worth a fraction of its original price, and settlement costs far less than the value extracted.

## Conclusion

Rounding errors — that ancient nemesis from the days of double-precision floating-point — have re-emerged as million-dollar exploits on chains supposedly mathematically trustless.

Developers have built fault-tolerant consensus algorithms, cryptographic proofs of work, and zero-knowledge rollups, only to be defeated by the mere difference between `0.99999999999999` and `1.0`. The Balancer V2 exploit demonstrates that even a difference of `1 wei`, if cleverly repeated and amplified, can tip the scales from negligible to catastrophic. The blockchain is ruthlessly accurate; it only cares about the math, not about intentions or audits.

In smart contracts, every rounding decision matters. If a calculation must round, it must round in favor of the protocol. That means when determining amounts a user should receive, round the result down; when determining what a user should pay or leave in the pool, round up. Had this principle been consistently applied in Balancer V2’s code, this exploit would not have been possible. Following the incident, Balancer took action to stop further attacks and fix the vulnerability.

Likewise, the [team sent an on-chain message](https://x.com/Balancer/status/1986840336065569212) to all known addresses involved in the exploit, offering a path for the hacker to work in good faith to recover the stolen assets. In connection with this exploit, a [new value extraction was identified](https://x.com/Balancer/status/1988685056982835470) in the V2 metastable pools, and the Balancer team promptly initiated a whitehat recovery to secure $4.1 million in assets for reconciliation and return.

Somewhere in the chaos of that early November morning, a hacker was undoubtedly thanking the **rounding gods** for every misplaced decimal. As for the rest of us, we are still haunted by the oldest bug in the book — a flawed math operation.

## References

- [https://www.openzeppelin.com/news/understanding-the-balancer-v2-exploit](https://www.openzeppelin.com/news/understanding-the-balancer-v2-exploit)
- https://blog.unvariant.io/balancer-hack-explained/
- [https://x.com/blocksecteam/status/1986057732810518640](https://x.com/blocksecteam/status/1986057732810518640)
- [https://www.certora.com/blog/breaking-down-the-balancer-hack](https://www.certora.com/blog/breaking-down-the-balancer-hack)