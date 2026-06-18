<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'technician', 'user']);
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('technician')) return $order->technician_id === $user->id;
        return $order->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('technician')) return $order->technician_id === $user->id;
        return false;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }
}
